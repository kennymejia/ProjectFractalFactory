const dotenv = require('dotenv');
dotenv.config();
const logController = require('./controllers/logController.js');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const provider = require('./providers/postgresProvider');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const initializePassport = require('./passport-config');

// Initialize passport with some database functions for authentication
initializePassport.initialize(
    passport,
    async username => await provider.getUserByUsername(username),
    async id => await provider.getUserById(id)
);


////////////////////// Express and Passport Settings //////////////////////
app.use(bodyParser.json({ type: 'application/json'}));
app.use(express.static(`client/public`));
app.use(express.urlencoded({ extended: false })); // Access form posts in request method
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method')); // Used to change method to clearer one for form posts

app.set('views', 'client/views');
app.set('view-engine', 'ejs');


////////////////////// Page routing //////////////////////
app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.get('/profile', checkAuthenticated, function (req,res) {
    res.render('profile.ejs');
});

app.get('/about', checkNotAuthenticated, function (req,res) {
    res.render('about.ejs');
});

app.get('/results', checkAuthenticated, function (req,res) {
    res.render('results.ejs');
});


//////////////////////  Data routing //////////////////////
// Either log in a user with an account or deny access
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

// Register new user with provided details
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        let hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create user of account type 'default'
        await provider.addUser(req.body.username, hashedPassword, 'default');

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

// Get user paintings
app.get('/userPaintings', checkAuthenticated, async (req, res) => {
    try {
        console.log(req);
        // let userPaintingsInfo = provider.getUserPaintingsInfo()
    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }
});

// Simple 404 page
app.get('*', function(req, res){
    res.status(404).send('404 Error -- The droids you are looking for are not here');
});


////////////////////// Route Access Checks //////////////////////
// Make sure user is authenticated before allowing access to protected routes
function checkAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return next();
    }
    res.redirect('/');
}

// Make sure user is not authenticated before allowing access to unprotected routes
function checkNotAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return res.redirect('/profile');
    }
    next();
}

////////////////////// Port Listening //////////////////////
app.listen(process.env.PORT, () => {
	console.log(`fractalFactory is running on port ${process.env.PORT}`);
	logController.logger.info(`fractalFactory is running on port ${process.env.PORT}`);
});