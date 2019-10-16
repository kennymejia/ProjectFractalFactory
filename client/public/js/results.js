var displayLoading = msg => {
    // Create loading display
    let loadingDiv = document.createElement("div");
    loadingDiv.id = 'loadingDiv';

    // Create loading gif
    let loadingSymbol = document.createElement("img");
    loadingSymbol.id = 'loadingSymbol';
    loadingSymbol.src = '/images/dodecahedron.gif';

    // Create loading stage description
    let loadingStage = document.createElement("div");
    loadingStage.id = 'loadingStage';
    loadingStage.innerHTML = msg;

    // Append children to html
    loadingDiv.appendChild(loadingSymbol);
    loadingDiv.appendChild(loadingStage);

    // Clear and replace center div html
    let centerDiv = document.getElementById('centerDiv');
    centerDiv.innerHTML = '';
    centerDiv.appendChild(loadingDiv);
};

window.addEventListener('load', (event) => {
    let paintings = document.querySelectorAll('.painting');

    for (let painting of paintings) {
        painting.addEventListener('click', async (e) => {
            displayLoading('Running Neural Network')

            // Get painting id
            let fullPath = painting.src;
            let paintingId = fullPath.replace(/^.*[\\\/]/, '');

            // Get user source file id
            let url = window.location.href;
            url = url.split('/');
            let userSourceFileId = url[url.length-1];

            // Request a new user painting to be made and go to purchase page
            document.location.href = `/generate-user-painting/${userSourceFileId}/${paintingId}`;
        });
    }

});