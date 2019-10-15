window.addEventListener('load', (event) => {
    let paintings = document.querySelectorAll('.painting');

    for (let painting of paintings) {
        painting.addEventListener('click', (e) => {
            // Display loading symbol
            let loadingDiv = `<div id="loadingDiv">
                                <img id="loadingSymbol" src='/images/dodecahedron.gif'/>
                                <div id="loadingStage">Starting Neural Network</div>
                              </div>`
            let centerDiv = document.getElementById('centerDiv')
            centerDiv.innerHTML = loadingDiv;

            // Get painting id
            let fullPath = painting.src;
            let paintingId = fullPath.replace(/^.*[\\\/]/, '');

        })
    }

});