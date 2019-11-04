const dotenv = require("dotenv");
dotenv.config();

const logController = require('./controllers/logController.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const provider = require('./providers/postgresProvider');

const casStrategy = require('passport-cas2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports.initialize = (passport, getUserByAccount, getUserById) => {

    const authenticateUserLocal = async (username, password, done) => {
        const user = await getUserByAccount(username, 'default');

        if(user == null) {
            return done( null, false, { message: 'No user with that username'} );
        }

        try {

            if( await bcrypt.compare(password, user.password) ) {
                provider.updateLoginDate(user.user_id);
                return done(null, user);
            }else {
                return done(null, false, { message: 'Password incorrect'} );
            }

        } catch(e) {
            console.log(e);
            logController.logger.error(e);

            return done(e);
        }
    };

    const authenticateUserFacebook = async (accessToken, refreshToken, profile, done) => {
        let user = await getUserByAccount(profile.id, profile.provider);

        try {

            if(user == null) {
                // Create user of account type 'facebook'
                await provider.addUser(profile.id, null,
                                       profile.provider, profile.name.givenName || null,
                                       profile.name.familyName || null, profile.emails[0].value || null);


                user = await getUserByAccount(profile.id, profile.provider);
                return done(null, user);

            } else {
                provider.updateLoginDate(user.user_id);
                return done(null, user);
            }
        } catch(e) {
            console.log(e);
            logController.logger.error(e);

            return done(e);
        }
    };

    const authenticateUserTwitter = async (token, tokenSecret, profile, done) => {
        let user = await getUserByAccount(profile.id, profile.provider);

        try {

            if(user == null) {
                // Create user of account type 'twitter'
                await provider.addUser(profile.id, null,
                                       profile.provider, null,
                                       null, null);

                user = await getUserByAccount(profile.id, profile.provider);
                return done(null, user);

            } else {
                provider.updateLoginDate(user.user_id);
                return done(null, user);
            }

        }catch(e){
            console.log(e);
            logController.logger.error(e);

            return done(e);
        }
    };

    const authenticateUserCas = async (username, profile, done) => {
        let user = await getUserByAccount(profile.id, profile.provider);

        try {

            if(user == null) {
                // Create user of account type 'cas'
                // ID is also user's email in this instance
                await provider.addUser(profile.id, null,
                                       profile.provider, profile.name.givenName || null,
                                       profile.name.familyName || null, profile.id);

                user = await getUserByAccount(profile.id, profile.provider);
                return done(null,user);

            } else {
                provider.updateLoginDate(user.user_id);
                return done(null, user);
            }

        }catch(e){
            console.log(e);
            logController.logger.error(e);

            return done(e);
        }
    };

    // Local strategy for logging in
    passport.use( new LocalStrategy( {
        usernameField: 'username'
    }, authenticateUserLocal) );

    // Facebook strategy for logging in
    passport.use(new FacebookStrategy( {
        clientID: process.env.FACEBOOKCLIENTID,
        clientSecret: process.env.FACEBOOKCLIENTSECRET,
        callbackURL: process.env.FACEBOOKCALLBACKURL,
        profileFields: ['id', 'emails']
    }, authenticateUserFacebook) );

    // Twitter strategy for logging in
    passport.use(new TwitterStrategy( {
        consumerKey: process.env.TWITTERCLIENTID,
        consumerSecret: process.env.TWITTERCLIENTSECRET,
        callbackURL: process.env.TWITTERCALLBACKURL,
        profileFields: ['id', 'emails']
    }, authenticateUserTwitter) );

    // CAS strategy for logging in
    passport.use(new casStrategy({
        casURL: 'https://login.marist.edu/cas/',
        pgtURL: process.env.CASMARISTCALLBACK
    }, authenticateUserCas) );

    passport.serializeUser((user, done) => done(null, user.user_id) );
    passport.deserializeUser((id, done) => done(null, getUserById(id)) );

};

