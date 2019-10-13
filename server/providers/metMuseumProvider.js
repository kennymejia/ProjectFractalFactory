const dotenv = require('dotenv');
dotenv.config();

const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const provider = require('./postgresProvider');

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
        let index = Math.floor(Math.random() * objectsJson.total); console.log(index);
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

var saveImageToDisk = (url, localPath) => {
    let file = fs.createWriteStream(localPath);
    https.get(url, res => {
        if (res.statusCode === 200){
            res.pipe(file);
        }
    });
};

var fillDatabase = async paintings => {
    for (let painting of paintings) {
        // TODO Calculate fractal dimension
        let fractalDimension = 1.5;
        let paintingId = await provider.addPainting(fractalDimension, painting.name,
                                            painting.painter || "Unidentified Artist",
                                                    painting.yearCreated);

        let filePath = `${process.env.PAINTINGDIRECTORY}/${paintingId}.jpg`;
        saveImageToDisk(painting.link, filePath);

        await provider.updatePaintingFileLocation(paintingId, filePath);
    }
};

var main = async () => {
    let paintings = await fetchPaintings(3);
    await fillDatabase(paintings);
};

main();
provider.getStatistics();