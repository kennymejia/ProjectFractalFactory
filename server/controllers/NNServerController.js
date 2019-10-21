const {promisify} = require('util');
const {PythonShell} = require('python-shell');
const pythonShellRun = promisify(PythonShell.run);
const provider = require('../providers/postgresProvider');
const logController = require('../controllers/logController.js');

module.exports = {

    // TODO Implement fractal dimension calculation
    calculateFractalDimension: async file => {
        try {
            let options = {
                scriptPath: './server/python',
                args: [file]
            };

            let data = await pythonShellRun('fractalDimension.py', options);

            return parseFloat(data[0]);
        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }
    },

    createPainting: async (userId, userSourceFileId, paintingId) => {
        await wait(5000);

        let userPaintingId = await provider.addUserPainting(userId, paintingId, userSourceFileId);

        // Use the original painting for now as the user painting
        let userPaintingLocation = await provider.getPaintingLocation(paintingId);
        await provider.updateUserPaintingFileLocation(userPaintingId, userPaintingLocation);

        return userPaintingId;
    }



};