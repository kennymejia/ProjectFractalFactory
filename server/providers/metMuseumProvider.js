const fetch = require('node-fetch');

let baseUrl = "https://collectionapi.metmuseum.org/public/collection/v1";

var fetchPaintings = async (amount) => {
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
          year_created: paintingsJson.objectEndDate,
          link: paintingsJson.primaryImage
        });

     } catch(e) {
       console.log(e);
     }
  }

  return paintings;
}

//fetchPaintings(3);
