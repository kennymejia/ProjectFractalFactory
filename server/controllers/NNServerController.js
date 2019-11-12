const dotenv = require('dotenv');
dotenv.config();

const fetch = require('node-fetch');
const formidable = require('formidable');
const FormData = require('form-data');
const fs = require('fs');
const provider = require('../providers/postgresProvider');
const logController = require('../controllers/logController.js');
const path = require('path')

// Note that these functions are meant to abstract the processes of calculating the fractal dimension, creating
// the user painting, and creating the blocks files. It is done locally, but may be changed to be done on another
// machine.
//
// Also, it may be necessary to change the python implementation from using promisify in order to get more than
// a single print out -- test as needed
module.exports = {

    // Returns the fractal dimension of the given file
    calculateFractalDimension: async (fileLocation, type) => {

        try {

            // Stream image file to API
            const formData = new FormData();
            formData.append('file', fs.createReadStream(fileLocation));
            formData.append('type', type);

            let request = {
                method: 'POST',
                body: formData
            };

            let response = await fetch(`${process.env.PYTHONAPI}/fractal-dimension`, request);
            response = await response.json();

            return response;

        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }

    },

    // Creates a user painting, creates database entry, and returns the id
    createPainting: async (userId, userSourceFileId, paintingId) => {

        try {
            let userPaintingId = await provider.addUserPainting(userId, paintingId, userSourceFileId);

            // Stream image file to API
            const formData = new FormData();
            formData.append('userSourceFile', fs.createReadStream(await provider.getUserSourceBlocksFileLocation(userSourceFileId)));
            formData.append('paintingFile', fs.createReadStream(await provider.getPaintingLocation(paintingId)));
            formData.append('userSourceFileFractalDimension', await provider.getUserSourceFileFractalDimension(userSourceFileId));
            formData.append('paintingFractalDimension', await provider.getPaintingFractalDimension(paintingId));
            formData.append('userPaintingId', userPaintingId);

            let request = {
                method: 'POST',
                body: formData
            };

            let response = await fetch(`${process.env.PYTHONAPI}/create-painting`, request);

            let userPaintingLocation = process.env.USERPAINTINGDIRECTORY+userPaintingId+'.png';

            // Save user painting
            await response.body.pipe( fs.createWriteStream(userPaintingLocation) );

            // Update the user painting file location to reflect newly generated painting
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

            // Stream text file to API
            const formData = new FormData();
            formData.append('file', fs.createReadStream(userSourceFileLocation));

            let request = {
                method: 'POST',
                body: formData
            };

            let response = await fetch(`${process.env.PYTHONAPI}/generate-bam`, request);

            let bamLocation = process.env.BLOCKFILEDIRECTORY+userSourceFileId+'.jpg';

            // Save BAM image
            await response.body.pipe(fs.createWriteStream(bamLocation));

            return bamLocation;

        } catch(e) {
            console.log(e);
            logController.logger.error(e);
        }

    }
};