const logController = require('./controllers/logController.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const provider = require('./providers/postgresProvider');

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
};
