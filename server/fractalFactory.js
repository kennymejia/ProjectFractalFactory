const configurationController = require('./controllers/configurationController.js');
const logController = require('./controllers/logController.js');
const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/json'}));

app.use(express.static(`client/public`));

app.set('views', 'client/views');
app.set('view-engine', 'ejs');

// Page routing
//app.get('/', function (req, res) {
//  res.sendFile('index.html', { root: `client/views` });
//})

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/profile.html', function (req,res) {
    res.sendFile('profile.html', {root: 'client/views'});
})

// Data routing
// app.route('')

// Simple 404 page
app.get('*', function(req, res){
    res.status(404).send('404 Error -- The droids you are looking for are not here');
});


app.listen(configurationController.configurationVariables.port, () => {
	console.log(`fractalFactory is running on port ${configurationController.configurationVariables.port}`);
	logController.logger.info(`fractalFactory is running on port ${configurationController.configurationVariables.port}`);
});

