const dotenv = require('dotenv');
dotenv.config();

const logController = require('./controllers/logController.js');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const postgresProvider = require('./providers/postgresProvider');

var bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/json'}));

app.use(express.static(`client/public`));
app.use(express.urlencoded({ extended: false })); // Access form posts in request method

app.set('views', 'client/views');
app.set('view-engine', 'ejs');

// Page routing
app.get('/', (req, res) => {
    res.render('login.ejs');
});

app.get('/register', function (req,res) {
    res.render('register.ejs');
});

app.get('/profile', function (req,res) {
    res.render('profile.ejs');
});

app.get('/about', function (req,res) {
    res.render('about.ejs');
});

app.get('/results', function (req,res) {
    res.render('results.ejs');
});

// Data routing
app.post('/login', (req, res) => {

});

app.post('/register', async (req, res) => {
    console.log('hello');
    try {
        let hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create user of default type in database
        await postgresProvider.query(`INSERT INTO users (user_account, password, account_type)
                                    VALUES ($1, $2, $3, $4)`, [req.body.username, hashedPassword, 'default']);

        // Redirect to login page so user can enter their details
        res.redirect('/');
    } catch(e) {
        console.log(e);
        logController.logger.error(e);

        // Redirect back to register page if problem
        res.redirect('/register');
    }
});

// Simple 404 page
app.get('*', function(req, res){
    res.status(404).send('404 Error -- The droids you are looking for are not here');
});


app.listen(process.env.PORT, () => {
	console.log(`fractalFactory is running on port ${process.env.PORT}`);
	logController.logger.info(`fractalFactory is running on port ${process.env.PORT}`);
});