const file_select = document.getElementById('file-select');
const title = document.getElementById('title');
const fileContentsDiv = document.getElementById('fileContents');
file_select.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    const selectedFile = e.target.files[0];
    const fileName = selectedFile.name;
    const partialFileName = e.target.files[0].name.toString().split('.');
    partialFileName.pop();
    title.innerText = partialFileName.join('');
    const reader = new FileReader();
    reader.onload = function (e) {
      const fileContents = e.target.result;
      fileContentsDiv.innerHTML = fileContents;
    };
    reader.readAsText(selectedFile);
    // Open associated CSS and JSON files
    const cssFileName = fileName.replace(/\.html$/, '.css');
    const jsonFileName = fileName.replace(/\.html$/, '.json');

    // Read CSS file contents
    fetch(cssFileName)
      .then((response) => response.text())
      .then((cssContents) =>
        console.log(`${cssFileName} Contents:\n${cssContents}`)
      );

    // Read JSON file contents
    fetch(jsonFileName)
      .then((response) => response.text())
      .then((jsonContents) =>
        console.log(`${jsonFileName} Contents:\n${jsonContents}`)
      );
  }
});
