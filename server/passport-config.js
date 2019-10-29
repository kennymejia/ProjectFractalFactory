const logController = require('./controllers/logController.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const provider = require('./providers/postgresProvider');

const casStrategy = require('passport-cas2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const dotenv = require("dotenv");
dotenv.config();

module.exports.initialize = function (passport, getUserByAccount, getUserById) {
    const authenticateUserLocal = async (username, password, done) => {
        const user = await getUserByAccount(username, 'default');

        if(user == null) {
            return done(null, false, { message: 'No user with that username'} );
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

    passport.use(new LocalStrategy({ usernameField: 'username'}, authenticateUserLocal));
    passport.serializeUser((user, done) => done(null, user.user_id) );
    passport.deserializeUser((id, done) => done(null, getUserById(id)) );

    // facebook strategy for logging in
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOKCLIENTID,
        clientSecret: process.env.FACEBOOKCLIENTSECRETE,
        callbackURL: process.env.FACEBOOKCALLBACKURL,
        profileFields: ['id', 'emails']
      },
        async function (accessToken, refreshToken, profile, done) 
        {
            var user = await getUserByAccount(profile.id, profile.provider);
            try{
                if(user == null) 
                {
                    let hashedPassword = null;
                    // Create user of account type 'facebook'
                    await provider.addUser(profile.id, hashedPassword, profile.provider);
                    return done(null,user);
                }
                else
                {
                    provider.updateLoginDate(user.user_id);
                    return done(null, user);
                }
            }catch(e){
                console.log(e);
                logController.logger.error(e);
                return done(e);
            }
        }
    ));

    // twitter strategy for logging in
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTERCLIENTID,
        consumerSecret: process.env.TWITTERCLIENTSECRETE,
        callbackURL: process.env.TWITTERCALLBACKURL,
        profileFields: ['id', 'emails']
      },
        async function (token, tokenSecrete, profile, done) 
        {
            var user = await getUserByAccount(profile.id, profile.provider);

            try{
                if(user == null) 
                {
                    let hashedPassword = null;
                    // Create user of account type 'twitter'
                    await provider.addUser(profile.id, hashedPassword, profile.provider);
                    return done(null,user);
                }
                else
                {
                    provider.updateLoginDate(user.user_id);
                    return done(null, user);
                }
            }catch(e){
                console.log(e);
                logController.logger.error(e);
                return done(e);
            }
        }
    ));
    
    // cas strategy for logging in
    passport.use(new casStrategy({
        casURL: 'https://login.marist.edu/cas/',
        pgtURL: process.env.CASMARISTCALLBACK
    },
        async function (username, profile, done)
        {   
            var user = await getUserByAccount(profile.id, profile.provider);

            try{
                if(user == null) 
                {
                    let hashedPassword = null;
                    // Create user of account type 'cas'
                    await provider.addUser(profile.id, hashedPassword, profile.provider);
                    return done(null,user);
                }
                else
                {
                    provider.updateLoginDate(user.user_id);
                    return done(null, user);
                }
            }catch(e){
                console.log(e);
                logController.logger.error(e);
                return done(e);
            }
        }
    ))
};

