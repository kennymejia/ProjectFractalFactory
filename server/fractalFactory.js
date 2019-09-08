const configurationController = require('./controllers/configurationController.js');
const logController = require('./controllers/logController.js');
const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/json'}));

app.use(express.static(`${__dirname}/index`));

// Page routing
app.get('/', function (req, res) {
  res.sendFile('interface.html', { root: `${__dirname}/index.html` });
})

// Simple 404 page
app.get('*', function(req, res){
    res.status(404).send('404 Error -- The droids you are looking for are not here');
});


app.listen(configurationController.configurationVariables.port, () => logController.logger.info(`museWatchdog is running on port ${configurationController.configurationVariables.port}`));

