const dotenv = require('dotenv');
dotenv.config();

const logController = require('./controllers/logController.js');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const postgresProvider = require('./providers/postgresProvider');

const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
initializePassport.initialize(
    passport,
    async username => {
        try {
            let result = await postgresProvider.query(`SELECT * FROM users 
                                           WHERE account_type = 'default' AND user_account = $1`, [username]);
            if (!result.rows) {
                return null;
            } else {
                return result.rows[0];
            }
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },
    async id => {
        let result = await postgresProvider.query(`SELECT * FROM users 
                                           WHERE account_type = 'default' AND user_id = $1`, [id]);
        if (!result.rows) {
            return null;
        } else {
            return result.rows[0];
        }
    });


const errorHandler = require('errorhandler');
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});


var bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/json'}));

app.use(express.static(`client/public`));
app.use(express.urlencoded({ extended: false })); // Access form posts in request method

app.set('views', 'client/views');
app.set('view-engine', 'ejs');

// For passport.js and sessions
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

// Page routing
app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.get('/register', checkNotAuthenticated, function (req,res) {
    res.render('register.ejs');
});

app.get('/profile', checkAuthenticated, function (req,res) {
    res.render('profile.ejs');
});

app.get('/about', checkAuthenticated, function (req,res) {
    res.render('about.ejs');
});

app.get('/results', checkAuthenticated, function (req,res) {
    res.render('results.ejs');
});

// Data routing

// Either log in a user with an account or deny access
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

// Register new user with provided details
app.post('/register', checkNotAuthenticated,  async (req, res) => {
    try {
        let hashedPassword = await bcrypt.hash(req.body.password, 10);

        //Create user of default type in database
        await postgresProvider.query(`INSERT INTO users (user_account, password, account_type)
                                   VALUES ($1, $2, $3)`, [req.body.username, hashedPassword, 'default']);

        // Redirect to login page so user can enter their details
        res.redirect('/');
    } catch(e) {
        console.log(e);
        logController.logger.error(e);

        // Redirect back to register page if problem
        res.redirect('/register');
    }
});

// Log a user out
app.delete('/logout', (req, res) => {
    req.logOut(); // Setup by passport
    res.redirect('/');
});

// Simple 404 page
app.get('*', function(req, res){
    res.status(404).send('404 Error -- The droids you are looking for are not here');
});

// Make sure user is authenticated before allowing access to protected routes
function checkAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return next();
    }
    res.redirect('/');
}

// Make sure user is not authenticated before allowing access to specified routes
function checkNotAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return res.redirect('/profile');
    }
    next();
}

app.listen(process.env.PORT, () => {
	console.log(`fractalFactory is running on port ${process.env.PORT}`);
	logController.logger.info(`fractalFactory is running on port ${process.env.PORT}`);
});