const logController = require('./controllers/logController.js');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports.initialize = function (passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = await getUserByUsername(username);

        if(user == null) {
            return done(null, false, { message: 'No user with that username'} );
        }

        try {
            if( await bcrypt.compare(password, user.password) ) {
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

    passport.use(new LocalStrategy({ usernameField: 'username'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.user_id) );
    passport.deserializeUser((id, done) => done(null, getUserById(id)) );
};
