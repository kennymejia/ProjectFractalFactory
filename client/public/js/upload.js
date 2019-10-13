function saveTextAsFile()
{ // TODO May use something like this later, but not here
	var textToWrite = document.getElementById("inputTextToSave").value;
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNum = 0;
    fileNum++;
    var fileNameToSaveAs = "file"+fileNum;

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	if (window.webkitURL != null)
	{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}


window.addEventListener('load', (event) => {
	// Put name of file that is being uploaded
	let input = document.getElementById( 'fileUpload' );
	let inputLabel = document.getElementById( 'fileUploadLabel' );

	input.addEventListener('change', e => {
		let fileName = input.files[0].name;
		inputLabel.innerHTML = fileName;
	});
});
