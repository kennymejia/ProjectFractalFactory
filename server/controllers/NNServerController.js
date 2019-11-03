const dotenv = require('dotenv');
dotenv.config();

const {promisify} = require('util');
const {PythonShell} = require('python-shell');
const pythonShellRun = promisify(PythonShell.run);
const provider = require('../providers/postgresProvider');
const logController = require('../controllers/logController.js');

// Note that these functions are meant to abstract the processes of calculating the fractal dimension, creating
// the user painting, and creating the blocks files. It is done locally, but may be changed to be done on another
// machine.
//
// Also, it may be necessary to change the python implementation from using promisify in order to get more than
// a single print out -- test as needed
module.exports = {

    // Returns the fractal dimension of the given file
    calculateFractalDimension: async fileLocation => {
        try {
            let options = {
                scriptPath: process.env.PYTHONDIRECTORY,
                args: [fileLocation]
            };

            // Get python output in a list (should just be the fractal dimension)
            let data = await pythonShellRun('fractalDimension.py', options);

            return parseFloat(data[0]);
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    // Creates a user painting, creates database entry, and returns the id
    createPainting: async (userId, userSourceFileId, paintingId) => {
        try {
            let userPaintingId = await provider.addUserPainting(userId, paintingId, userSourceFileId);

            // Use the original painting for now as the user painting
            let userPaintingLocation = await provider.getPaintingLocation(paintingId);
            await provider.updateUserPaintingFileLocation(userPaintingId, userPaintingLocation);

            return userPaintingId;
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    // Creates BAM or blocks file of user source file, updates user source file entry in database, and
    // returns location of the blocks file when done
    createBlocks: async (userId, userSourceFileId, userSourceFileLocation) => {
        try {
            let options = {
                scriptPath: process.env.PYTHONDIRECTORY,
                args: [userSourceFileLocation, process.env.BLOCKFILEDIRECTORY]
            };

            // Python output will just be the file location of the BAM/blocks file
            let data = await pythonShellRun('textToBlocks.py', options);

            return data[0];
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    }
};