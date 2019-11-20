/*
Description: Javascript for upload page. Contains logic for displaying loading gif when
             waiting for results of fractal dimension calculation as well as updating
             label for the file upload button.
Contributor(s): Eric Stenton
*/

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

	// Hide elements
	let uploadTextForm = document.getElementById('fileForm');
	let uploadFileForm = document.getElementById('textForm');
	let ffTitle = document.getElementsByClassName('ff')[0];
	uploadFileForm.style.display = 'none';
	uploadTextForm.style.display = 'none';
	ffTitle.style.display = 'none';

	// Append loading display
	let centerDiv = document.getElementsByClassName('centerDiv')[0];
	centerDiv.appendChild(loadingDiv);
};


window.addEventListener('load', (event) => {
	// Put name of file that is being uploaded
	let input = document.getElementById( 'fileUpload' );
	let inputLabel = document.getElementById( 'fileUploadLabel' );

	input.addEventListener('change', e => {
		let fileName = input.files[0].name;
		inputLabel.innerHTML = fileName;
	});

	// Loading display when submit buttons clicked
	let uploadTextBtn = document.getElementsByClassName('textAreaSubmit')[0];
	let uploadFileBtn = document.getElementsByClassName('form-submit-button')[0];

	uploadTextBtn.addEventListener('click', (e) => {
		displayLoading('Calculating Fractal Dimension');
	});

	uploadFileBtn.addEventListener('click', (e) => {
		displayLoading('Calculating Fractal Dimension');
	});

});
