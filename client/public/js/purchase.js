/*
Description: Javascript for purchase page. Contains logic for removing watermark and
             opening payment modal.
Contributor(s): Eric Stenton
*/

window.addEventListener('load', (event) => {
    let watermarkBtn = document.getElementById('watermarkBtn');
    let bitcoinBtn = document.getElementById('bitcoinBtn');
    let watermarkModal = document.getElementById('watermarkModal');

    watermarkBtn.addEventListener('click', async (e) => {
        watermarkModal.style.display = 'block';
    });

    bitcoinBtn.addEventListener('click', async (e) => {
        let request = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=UTF-8'
            },
            body: `{
                    "paintingId": "${document.getElementById('painting').src.replace(/^.*[\\\/]/,
                '')}"
                    }`
        };

        fetch('/watermark', request);
    });

});
