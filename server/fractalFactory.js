/*
Description: Contains the logic for page and data routing for the nodejs express server.
             This is the main file of the application.
Contributor(s): Eric Stenton, Kenny Mejia
 */

const dotenv = require('dotenv');
dotenv.config();
const logController = require('./controllers/logController.js');
const nn = require('./controllers/NNServerController');
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const provider = require('./providers/postgresProvider');
const passport = require('passport');
const flash = require('express-flash');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const initializePassport = require('./passport-config');
const formidable = require('formidable');
const fs = require('fs');
const fsp = require('fs').promises;
const {promisify} = require('util');
const getSize = require('get-folder-size');
const getSizeAsync = promisify(getSize);
const jimp = require("jimp");

const http = require('http');
const https = require('https');
const options = {
    key: fs.readFileSync(process.env.PRIVKEY),
    cert: fs.readFileSync(process.env.CERT)
};


// Initialize passport with some database functions for authentication
initializePassport.initialize(
    passport,
    async (userAccount, accountType) => await provider.getUserByAccount(userAccount, accountType),
    async id => await provider.getUserById(id)
);

////////////////////// Express and Passport Settings //////////////////////
app.all('*', ensureSecure); // at top of routing calls
app.use(bodyParser.json({ type: 'application/json'}));
app.use(express.static(`client/public`, {dotfiles: 'allow' } ));
app.use(express.urlencoded({ extended: false })); // Access form posts in request method
app.use(flash());
app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIEKEY1, process.env.COOKIEKEY2],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method')); // Used to change method to clearer one for form posts

app.set('views', 'client/views');
app.set('view-engine', 'ejs');

////////////////////// Page routing //////////////////////
app.get('/', (req, res) => {
    res.render('login.ejs', { loginMessage: {message: '', color: ''} });
});

app.get('/profile', checkAuthenticated, async (req,res) => {
    let user = await req.user;

    let userPaintingIds = []; // List of user painting ids -- pass to ejs
    let statistics; // Statistics for application use
    let userData; // User data to display in table and make administrative decisions

    try {
        userPaintingIds = await provider.getUserPaintingIds(user.user_id);

        // Admins get to see statistics and user table
        if (user.admin_flag) {
            statistics = await provider.getStatistics();
            userData = await provider.getUsers();

            // Add any additional statistics
            let size = await getSizeAsync(process.env.USERSOURCEFILEDIRECTORY);
            statistics["Size of Source File Directory"] = (size / 1024 / 1024).toFixed(2) + ' MB';
        }
    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }

    res.render('profile.ejs', { userPaintings: userPaintingIds,
                                statistics: statistics,
                                email: user.email,
                                firstName: user.first_name,
                                lastName: user.last_name,
                                users: userData});
});

app.get('/about', (req,res) => {
    res.render('about.ejs');
});

app.use('/results', express.static('client/public')); // Results/:id is a conceptual link, not a physical one
app.get('/results/:id', checkAuthenticated, async (req,res) => {
    let userSourceFileId = req.params.id;

    // Get list of painting ids -- pass to ejs
    let paintings = [];
    try {
        let fractalDimension = await provider.getUserSourceFileFractalDimension(userSourceFileId);

        paintings = await provider.getPaintingIds(fractalDimension);

        // Get metadata for paintings
        let metadata;
        for (let painting of paintings) {
            metadata = await provider.getPaintingMetadata(painting.painting_id);
            painting.name = metadata.name;
            painting.painter = metadata.painter;
            painting.year_created = metadata.year_created;
        }
    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }

    res.render('results.ejs', { paintings: paintings} );
});

app.get('/upload', checkAuthenticated, (req,res) => {
    res.render('upload.ejs');
});

app.use('/purchase', express.static('client/public')); // purchase/:id is a conceptual link, not a physical one
app.get('/purchase/:id', checkAuthenticated, async (req,res) => {
    let userPaintingId = req.params.id;
    res.render('purchase.ejs', { paintingLink: `/user-painting/${userPaintingId}`,
                                 paintingFullLink: `${process.env.HOST}/user-painting/${userPaintingId}`, // For canvas pop
                                 canvasPopKey: process.env.CANVASPOPKEY} );
});

//////////////////////  Data routing //////////////////////

// Either log in a user with an account or deny access
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

// Calling facebook strategy and redirecting to facebook login
app.route('/auth/facebook').get(passport.authenticate('facebook', { scope: ['email'] }));

//A route so facebook knows where to call back to
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

//Calling twitter strategy and redirecting to twitter login
app.route('/auth/twitter').get(passport.authenticate('twitter'));

//A route so twitter knows where to call back to
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true
}));

app.route('/auth/cas').get(
    passport.authenticate('cas', { failureRedirect: '/'}),
    function(req, res) {
        res.redirect('/profile');
});

// Register new user with provided details
app.post('/register', checkNotAuthenticated, async (req, res) => {

    try {
        // Check if user exists
        let user = await provider.getUserByAccount(req.body.username, 'default');

        if (!user) {
            let hashedPassword = await bcrypt.hash(req.body.password, 13);

            // Create user of account type 'default'
            await provider.addUser(req.body.username, hashedPassword, 'default',
                                   req.body.firstname, req.body.lastname || null, req.body.email);

            res.render('login.ejs', { loginMessage: {message: 'Account created', color: 'green'} });
        } else {
            res.render('login.ejs', { loginMessage: {message: 'Username already exists', color: 'red'} });
        }

    } catch(e) {
        console.log(e);
        logController.logger.error(e);

        // Redirect back to register page if problem
        res.redirect('/register');
    }
});

// Toggle admin status
app.post('/admin-status', checkAuthenticated, checkAdmin, async(req, res) => {
    let result = await provider.updateAdminFlag(req.body.affectedUserId, req.body.adminStatus);

    res.setHeader('Content-Type', 'application/json');
    res.send({"result": result});
});

// Toggle active status
app.post('/active-status', checkAuthenticated, checkAdmin, async(req, res) => {
    let result = await provider.updateActiveFlag(req.body.affectedUserId, req.body.activeStatus);

    res.setHeader('Content-Type', 'application/json');
    res.send({"result": result});
});

// Upload source code from file -- served to the url of the page that it is on
app.post('/upload', checkAuthenticated, async (req, res) => {
    try {
        let user = await req.user;

        // Make entry in database for user source file
        let userSourceFileId = await provider.addUserSourceFile(user.user_id);

        // Create user source file
        let userSourceFileLocation = `${process.env.USERSOURCEFILEDIRECTORY}${userSourceFileId}.txt`;
        let form = new formidable.IncomingForm();
        form.maxFileSize = 10 * 1024 * 1024;

        form.parse(req);
        form.on('fileBegin', (name, file) => {
            //Reject files not of text type
            if ( file.type.split('/')[0] == 'text' ) {
                file.path = userSourceFileLocation;
            }
        });

        form.on('file', async (name, file) => {

            // Redirect if file doesn't exist
            if ( !fs.existsSync(userSourceFileLocation) ) {
                return res.redirect('/upload');
            }

            // Change file permissions -- non-executable, read and write
            fs.chmodSync(userSourceFileLocation, 0o666);

            // Update entry in database with file location
            await provider.updateUserSourceFileLocation(userSourceFileId, userSourceFileLocation);

            // Create BAM/blocks file
            let userBlocksFileLocation = await nn.createBlocks(user.user_id, userSourceFileId, userSourceFileLocation);
            await provider.updateUserBlocksFileLocation(userSourceFileId, userBlocksFileLocation);

            // Update entry in database with fractal dimension
            let fractalDimension = await nn.calculateFractalDimension(userBlocksFileLocation, 'bam');
            await provider.updateUserSourceFractalDimension(userSourceFileId, fractalDimension);

            res.redirect(`/results/${userSourceFileId}`);
        });

    } catch(e) {
        console.log(e);
        logController.logger.error(e);

        // Redirect back to register page if problem
        res.redirect('/profile');
    }
});

// Upload source code from text
app.post('/uploadText', checkAuthenticated, async (req, res) => {

    try {
        let user = await req.user;

        // Make entry in database for user source file
        let userSourceFileId = await provider.addUserSourceFile(user.user_id);

        // Create user source file
        let userSourceFileLocation = `${process.env.USERSOURCEFILEDIRECTORY}${userSourceFileId}.txt`;
        await fsp.writeFile(userSourceFileLocation, req.body.text);

        // Change file permissions -- non-executable, read and write
        fs.chmodSync(userSourceFileLocation, 0o666);

        // Update entry in database with file location
        await provider.updateUserSourceFileLocation(userSourceFileId, userSourceFileLocation);

        // Create BAM/blocks file
        let userBlocksFileLocation = await nn.createBlocks(user.user_id, userSourceFileId, userSourceFileLocation);
        await provider.updateUserBlocksFileLocation(userSourceFileId, userBlocksFileLocation);

        // Update entry in database with fractal dimension
        let fractalDimension = await nn.calculateFractalDimension(userBlocksFileLocation, 'bam');
        await provider.updateUserSourceFractalDimension(userSourceFileId, fractalDimension);

        res.redirect(`/results/${userSourceFileId}`);

    } catch(e) {
        logController.logger.error(e);

        // Redirect back to register page if problem
        res.redirect('/profile');
    }
});

// Upload paintings from admin profile
app.post('/profile', checkAuthenticated, checkAdmin, async (req, res) => {

    try {
        new formidable.IncomingForm().parse(req, async(err, fields, files) => {
            if (err) {
                console.log(err);
                logController.logger.error(err);
            }

            for (const file of Object.entries(files)) {
                let paintingId = await provider.addPainting(fields.name,
                    fields.painter || "Unidentified Artist",
                    fields.yearCreated);

                // Add file path
                let paintingFileLocation = `${process.env.PAINTINGDIRECTORY}${paintingId}.jpg`;
                await fsp.rename(file[1].path, paintingFileLocation);
                await provider.updatePaintingFileLocation(paintingId, paintingFileLocation);

                // Add fractal dimension -- if null, it means the painting was not RGB format
                let fractalDimension = await nn.calculateFractalDimension(paintingFileLocation, 'painting');
                await provider.updatePaintingFractalDimension(paintingId, fractalDimension);
                res.redirect('/profile'); // Redirect to same page
            }
        })

    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }
});

// Remove watermark from specified user painting
app.post('/watermark', async (req, res) => {
    await provider.updateWatermark(req.body.paintingId);
});

// Log a user out
app.delete('/logout', checkAuthenticated, (req, res) => {
    req.logOut(); // Setup by passport
    res.redirect('/');
});


// Create user painting
app.get('/generate-user-painting/:userSourceFileId/:paintingId', checkAuthenticated, async (req, res) => {

    try {
        let user = await req.user;

        let userId = user.user_id;
        let userSourceFileId = req.params.userSourceFileId;
        let paintingId = req.params.paintingId;

        let userPaintingId = await nn.createPainting(userId, userSourceFileId, paintingId);

        res.redirect(`/purchase/${userPaintingId}`);

    } catch(e) {
        console.log(e);
        logController.logger.error(e);
    }
});

// Get a user painting
app.get('/user-painting/:id', checkAuthenticated, async (req, res) => {

    try {
        let user = await req.user; // Make sure it is a painting associated with requesting user
        let userPaintingId = req.params.id;

        let userPaintingLocation = await provider.getUserPaintingLocation(user.user_id, userPaintingId);

        if (userPaintingLocation) {
            // Add watermark if user did not pay to remove it
            if ( await provider.getWatermark(userPaintingId) ) {
                let painting = await jimp.read(userPaintingLocation);
                let watermark = await jimp.read(process.env.WATERMARKFILE);

                watermark.resize(50, 50);
                painting.resize(200, 200);

                let image = painting.clone().composite(watermark, 140, 140, {
                    mode: jimp.BLEND_SOURCE_OVER,
                    opacitySource: 0.5,
                    opacityDest: 0.9
                });
                let buffer = await image.getBufferAsync(jimp.MIME_PNG);

                res.write(buffer,'binary');
                res.end(null, 'binary');
            } else {
                res.sendFile(userPaintingLocation);
            }
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

// Get heatmap datasets
app.get('/heatmap', checkAuthenticated, checkAdmin, async (req, res) => {
    let heatmapDatasets = await provider.getHeatmapData();
    res.send(heatmapDatasets);
});

// 404 = return to login/profile
app.get('*', (req, res) => {
    res.redirect('/');
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

// Make sure user is an admin
async function checkAdmin (req, res, next) {
    let user = await req.user;

    if (user.admin_flag) {
        return next();
    }

    // Send empty array back so that heat map won't be generated for non-admin
    res.send([]);
}

function ensureSecure(req, res, next){
    if(req.secure){
        return next();
    }

    res.redirect('https://' + req.hostname + req.url);
}

////////////////////// Port Listening //////////////////////
http.createServer(app).listen(process.env.PORT, () => {
    console.log(`Fractal Factory http is running on port ${process.env.PORT}`);
    logController.logger.info(`fractalFactory http is running on port ${process.env.PORT}`);
});

https.createServer(options, app).listen(process.env.SSLPORT, () => {
	console.log(`Fractal Factory https is running on port ${process.env.SSLPORT}`);
	logController.logger.info(`fractalFactory httpS is running on port ${process.env.SSLPORT}`);
});