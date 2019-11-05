window.addEventListener('load', (event) => {
    let watermarkBtn = document.getElementById('watermarkBtn');
    let watermarkModal = document.getElementById('watermarkModal');

    watermarkBtn.addEventListener('click', async (e) => {
        watermarkModal.style.display = 'block';
    });

});