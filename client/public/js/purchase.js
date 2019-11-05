window.addEventListener('load', (event) => {
    let watermarkBtn = document.getElementById('watermarkBtn');
    let watermarkModal = document.getElementById('watermarkModal');

    watermarkBtn.addEventListener('click', async (e) => {
        watermarkModal.style.display = 'block';

        // Just for development
        let request = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=UTF-8'
            },
            body: `{
                    "buttonId": "unique id for this embeddable button",
                    "code": "XWVX5XXZ",
                    "event": "charge_confirmed",
                    "paintingId": "${document.getElementById('painting').src.replace(/^.*[\\\/]/,
                                 '')}"
                    }`
        };

        fetch('/watermark', request);
    });

    // Coinbase event callbacks
    BuyWithCrypto.registerCallback('onSuccess', e => {
        console.log(e);
        let request = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=UTF-8'
            },
            body: e
        };

        fetch('/watermark', request);

    });

    BuyWithCrypto.registerCallback('onFailure', e => {
        console.log(e);
        let request = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=UTF-8'
            },
            body: e
        };

        fetch('/watermark', request);

    });

    BuyWithCrypto.registerCallback('onPaymentDetected', e =>{
        console.log(e);
        let request = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=UTF-8'
            },
            body: e
        };

        fetch('/watermark', request);

    });

});
