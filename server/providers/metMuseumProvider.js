const dotenv = require('dotenv');
dotenv.config();

const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const provider = require('./postgresProvider');
const nn = require('../controllers/NNServerController');

let baseUrl = "https://collectionapi.metmuseum.org/public/collection/v1";

// The API uses headers that don't function well with Node's new http parser, so use --http-parser=legacy
// when calling these functions

var fetchPaintings = async amount => {
  let objectsResult;
  let objectsJson;

  let paintings = [];
  let paintingsResult;
  let paintingsJson;

  try {
    objectsResult = await fetch(`${baseUrl}/search?medium=Paintings&hasImages=true&q=painting`);
    objectsJson = await objectsResult.json();
  } catch (e) {
    console.log(e);
  }


  for(let i = 0; i < amount; i++){
     try {
        let index = Math.floor(Math.random() * objectsJson.total);
        paintingsResult = await fetch(`${baseUrl}/objects/${objectsJson.objectIDs[index]}`);
        paintingsJson = await paintingsResult.json();

        paintings.push({
          name: paintingsJson.title,
          painter: paintingsJson.artistDisplayName,
          yearCreated: paintingsJson.objectEndDate,
          link: paintingsJson.primaryImage
        });

     } catch(e) {
       console.log(e);
     }
  }

  return paintings;
};


var fillDatabase = async paintings => {
    for (let painting of paintings) {
        let paintingId = await provider.addPainting(painting.name,
                                            painting.painter || "Unidentified Artist",
                                                    painting.yearCreated);

        // Add file path
        let filePath = `${process.env.PAINTINGDIRECTORY}${paintingId}.jpg`;

        // Save image to disk
        let file = fs.createWriteStream(filePath);
        https.get(painting.link, res => {
            if (res.statusCode === 200){
                res.pipe(file);

                res.on('end', async() => {

                    await provider.updatePaintingFileLocation(paintingId, filePath);

                    // Add fractal dimension -- if null, it means the painting was not RGB format
                    let fractalDimension = await nn.calculateFractalDimension(filePath, 'painting');

                    await provider.updatePaintingFractalDimension(paintingId, fractalDimension);
                });
            }
        });

    }
};

var main = async () => {
    let paintings = await fetchPaintings( parseInt(process.argv[2]) );
    await fillDatabase(paintings);
};

main();