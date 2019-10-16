const provider = require('../providers/postgresProvider');

async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports = {

    // TODO Implement fractal dimension calculation
    calculateFractalDimension: async file => {
       await wait(5000);
       return 1.5;
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