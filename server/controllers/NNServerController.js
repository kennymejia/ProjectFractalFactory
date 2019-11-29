/*
Description: Controls the interaction between the main application and Flask API. Note that
             these functions are meant to abstract the processes of calculating the fractal
             dimension, creating the user painting, and creating the BAM files.
Contributor(s): Eric Stenton
 */

const dotenv = require('dotenv');
dotenv.config();

const fetch = require('node-fetch');
const formidable = require('formidable');
const FormData = require('form-data');
const fs = require('fs');
const provider = require('../providers/postgresProvider');
const logController = require('../controllers/logController.js');
const path = require('path');
const AbortController = require('abort-controller');

const controller = new AbortController();
const signal = controller.signal;

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
                body: formData,
                signal: signal
            };

            let output;

            setTimeout(() => controller.abort(), 120000);
            let response = await fetch(`${process.env.PYTHONAPI}/fractal-dimension`, request).catch(err => {
                console.log(err);
                logController.logger.error(err);
            });

            if (response && response.ok) {
                response = await response.json();
                output = response;
            }

            return output;


        } catch(e) {
            console.log(e);
            logController.logger.error(e);
            return null;
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
                body: formData,
                signal: signal
            };

            let output;

            setTimeout(() => controller.abort(), 180000);
            let response = await fetch(`${process.env.PYTHONAPI}/create-painting`, request).catch(err => {
                console.log(err);
                logController.logger.error(err);
            });

            if (response && response.ok) {
                let userPaintingLocation = process.env.USERPAINTINGDIRECTORY+userPaintingId+'.png';

                // Save user painting
                await response.body.pipe( fs.createWriteStream(userPaintingLocation) );

                // Update the user painting file location to reflect newly generated painting
                await provider.updateUserPaintingFileLocation(userPaintingId, userPaintingLocation);

                output = userPaintingId;
            }

            return output;

        } catch(e) {
            console.log(e);
            logController.logger.error(e);
            return null;
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
                body: formData,
                signal: signal
            };

            let output;

            setTimeout(() => controller.abort(), 120000);
            let response = await fetch(`${process.env.PYTHONAPI}/generate-bam`, request).catch(err => {
                console.log(err);
                logController.logger.error(err);
            });

            if (response && response.ok) {
                let bamLocation = process.env.BLOCKFILEDIRECTORY+userSourceFileId+'.jpg';

                // Save BAM image
                await response.body.pipe(fs.createWriteStream(bamLocation));

                output = bamLocation;
            }

            return output

        } catch(e) {
            console.log(e);
            logController.logger.error(e);
            return null;
        }

    }
};