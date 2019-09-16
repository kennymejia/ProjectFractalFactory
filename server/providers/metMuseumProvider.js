const fetch = require('node-fetch');

let baseUrl = "https://collectionapi.metmuseum.org/public/collection/v1";

var test = async () => {
  let objectsResult = await fetch(`${baseUrl}/objects`);

  let objectsJson = await objectsResult.json();

  let paintings = [];
  let paintingsResult;
  let paintingsJson;
  for(let i = 0; i < 5; i++){
    let index = Math.floor(Math.random() * objectsJson.total); console.log(index);
    paintingsResult = await fetch(`${baseUrl}/objects/${index}`);
    paintingsJson = await paintingsResult.json();

    paintings.push(paintingsJson);
  }

  console.log(paintings);
}

test();
