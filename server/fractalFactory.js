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
const formidable = require('formidable');
const fs = require('fs');
const fsp = require('fs').promises;

// Initialize passport with some database functions for authentication
initializePassport.initialize(
    passport,
    async username => await provider.getUserByAccount(username),
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

app.get('/profile', checkAuthenticated, async (req,res) => {
    // Get list of user painting ids -- pass to ejs
    let userPaintingIds = [];
    try {
        let user = await req.user;
        userPaintingIds = await provider.getUserPaintingIds(user.user_id);
    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }

    res.render('profile.ejs', { userPaintings: userPaintingIds});
});

app.get('/about', (req,res) => {
    res.render('about.ejs');
});

app.get('/results', checkAuthenticated, (req,res) => {
    res.render('results.ejs');
});

app.get('/upload', checkAuthenticated, function (req,res) {
    res.render('upload.ejs');
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
        let hashedPassword = await bcrypt.hash(req.body.password, 15);

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

// Upload source code from file -- served to the url of the page that it is on
app.post('/upload', checkAuthenticated, async (req, res) => {
    let user = await req.user;

    // Make entry in database for user source file
    let userSourceFileId = await provider.addUserSourceFile(user.user_id);

    // Create user source file
    let filePath = `${process.env.USERSOURCEFILEDIRECTORY}/${userSourceFileId}.txt`;
    let form = new formidable.IncomingForm();
    form.maxFileSize = 10 * 1024 * 1024;

    form.parse(req);
    form.on('fileBegin', (name, file) => {
        file.path = filePath;
    });

    form.on('file', async (name, file) => {
        // Update entry in database with file location
        await provider.updateUserSourceFileLocation(userSourceFileId, filePath);

        // TODO Calculate fractal dimension

        // TODO Redirect to choosing 3 paintings page

        // TODO Security with file permissions
        res.redirect('/profile');
    });
});

// Upload source code from text
app.post('/uploadText', checkAuthenticated, async (req, res) => {
    try {
        let user = await req.user;

        // Make entry in database for user source file
        let userSourceFileId = await provider.addUserSourceFile(user.user_id);

        // Create user source file
        let filePath = `${process.env.USERSOURCEFILEDIRECTORY}/${userSourceFileId}.txt`;
        await fsp.writeFile(filePath, req.body.text);

        // Update entry in database with file location
        await provider.updateUserSourceFileLocation(userSourceFileId, filePath);

        // TODO Calculate fractal dimension

        // TODO Redirect to choosing 3 paintings page

        // TODO Security with file permissions
        res.redirect('/profile');
    } catch(e) {
        console.log(e);
        logController.logger.error(e);

        // Redirect back to register page if problem
        res.redirect('/profile');
    }
});

// Log a user out
app.delete('/logout', checkAuthenticated, (req, res) => {
    req.logOut(); // Setup by passport
    res.redirect('/');
});

// Get a user painting
app.get('/user-painting/:id', checkAuthenticated, async (req, res) => {
    try {
        let user = await req.user; // Make sure it is a painting associated with requesting user
        let userPaintingId = req.params.id;

        let userPaintingLocation = await provider.getUserPaintingLocation(user.user_id, userPaintingId);

        if (userPaintingLocation) {
            res.sendFile(userPaintingLocation);
        }
    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }
});

// Get a painting
app.get('/painting/:id', checkAuthenticated, async (req, res) => {
    try {
        let paintingId = req.params.id;

        let paintingLocation = await provider.getPaintingLocation(paintingId);

        if (paintingLocation) {
            res.sendFile(paintingLocation);
        }
    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }
});

// Simple 404 page
app.get('*', function(req, res) {
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

