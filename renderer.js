const file_select = document.getElementById("file-select");
const title = document.getElementById("title");
const fileContentsDiv = document.getElementById("fileContents");
const resizeContainer = document.getElementById("resizeContainer");

let svgElement;
let isResizing = false;
let initialX, initialY, initialWidth, initialHeight;

file_select.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    const selectedFile = e.target.files[0];
    const fileName = selectedFile.name;
    const partialFileName = e.target.files[0].name.toString().split(".");
    partialFileName.pop();
    title.innerText = partialFileName.join("");
    const reader = new FileReader();
    reader.onload = function (e) {
      const fileContents = e.target.result;
      fileContentsDiv.innerHTML = fileContents;

      handleSVGAttributes();
    };
    reader.readAsText(selectedFile);
    // Open associated CSS and JSON files
    const cssFileName = fileName.replace(/\.html$/, ".css");
    const jsonFileName = fileName.replace(/\.html$/, ".json");

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

function handleSVGAttributes() {
  // Get the child div element (fileContents)
  const fileContent = resizeContainer.querySelector("#fileContents");

  // Get the child SVG element
  svgElement = fileContent.querySelector("svg");

  // Get the width and height attributes of the SVG
  const svgWidth = svgElement.getAttribute("width");
  const svgHeight = svgElement.getAttribute("height");

  const boxWidth = fileContentsDiv.offsetWidth;
  const boxHeight = fileContentsDiv.offsetHeight;

  resizeContainer.style.width = svgWidth;
  resizeContainer.style.height = boxHeight;

  resizeContainer.addEventListener("mousedown", startResizing);
}

function startResizing(e) {
  e.preventDefault();
  isResizing = true;

  // Get initial mouse position
  initialX = e.clientX;
  initialY = e.clientY;
  initialWidth = resizeContainer.offsetWidth;
  initialHeight = resizeContainer.offsetHeight;

  // Add mousemove and mouseup event listeners to handle resizing
  document.addEventListener("mousemove", handleResizing);
  document.addEventListener("mouseup", stopResizing);
}

function handleResizing(e) {
  if (!isResizing) return;

  // Calculate the change in mouse position
  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

  // Update the width of the resizeContainer
  let newWidth = initialWidth + deltaX;
  let newHeight = initialHeight + deltaY;

  newHeight = Math.max(newHeight, 50);
  newWidth = Math.max(newWidth, 170);

  svgElement.setAttribute("width", newWidth);
  svgElement.setAttribute("height", newHeight);

  // Set the new width
  resizeContainer.style.width = `${newWidth}px`;
  resizeContainer.style.height = `${newHeight + 80}px`;
}

function stopResizing() {
  isResizing = false;

  // Remove mousemove and mouseup event listeners to stop resizing
  document.removeEventListener("mousemove", handleResizing);
  document.removeEventListener("mouseup", stopResizing);
}

document.addEventListener("DOMContentLoaded", function () {
  // Call handleSVGAttributes after DOMContentLoaded to handle SVG attributes
  handleSVGAttributes();
});
