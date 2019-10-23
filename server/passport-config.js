const logController = require('./controllers/logController.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const provider = require('./providers/postgresProvider');

const CasStrategy = require('passport-cas2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require("dotenv");
dotenv.config();

module.exports.initialize = function (passport, getUserByAccount, getUserById) {
    const authenticateUserLocal = async (username, password, done) => {
        const user = await getUserByAccount(username);

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


    passport.use(new FacebookStrategy({
        clientID: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRETE,
        callbackURL: process.env.CALLBACKURL,
        profileFields: ['id', 'emails']
      },
        async function (accessToken, refreshToken, profile, done) 
        {
            const user = await getUserByAccount(profile.emails[0].value);
            
            try{
                if(user == null) 
                {
                    let hashedPassword = await bcrypt.hash(profile.id, 15);
                    // Create user of account type 'default'
                    console.log(profile.id);
                    console.log(profile.emails[0].value);
                    console.log(hashedPassword);
                    await provider.addUser(profile.emails[0].value, hashedPassword, 'default');
                    return done(null,user);
                }
                else( await bcrypt.compare(profile.emails[0].value, profile.id) ) 
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
};
