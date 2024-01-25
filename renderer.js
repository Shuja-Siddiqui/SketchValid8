const { ipcRenderer } = require('electron');
const MM_TO_PX = 3.7795275591;
let mySvg;
let ORIGINAL_WIDTH;
let ORIGINAL_HEIGHT;
let main;

const adjustSize = () => {
  if (mySvg) {
    const parentWidth = main?.clientWidth;
    if (ORIGINAL_WIDTH > parentWidth) {
      mySvg.setAttribute('width', `${parentWidth / MM_TO_PX}mm`);
      mySvg.setAttribute(
        'height',
        `${(parentWidth * (ORIGINAL_HEIGHT / ORIGINAL_WIDTH)) / MM_TO_PX}mm`
      );
      mySvg.childNodes.forEach((el) => {
        if (el.nodeName.toLowerCase() !== '#text') {
          const x1 = el?.getAttribute('x1');
          const x2 = el?.getAttribute('x2');
          const y1 = el?.getAttribute('y1');
          const y2 = el?.getAttribute('y2');
          if (x1 && x1 != '0mm') {
            el.setAttribute('x1', `${parentWidth / MM_TO_PX}mm`);
          }
          if (x2 && x2 != '0mm') {
            el.setAttribute('x2', `${parentWidth / MM_TO_PX}mm`);
          }
          if (y1 && y1 != '0mm') {
            el.setAttribute(
              'y1',
              `${
                (parentWidth * (ORIGINAL_HEIGHT / ORIGINAL_WIDTH)) / MM_TO_PX
              }mm`
            );
          }
          if (y2 && y2 != '0mm') {
            el.setAttribute(
              'y2',
              `${
                (parentWidth * (ORIGINAL_HEIGHT / ORIGINAL_WIDTH)) / MM_TO_PX
              }mm`
            );
          }
        }
      });
    } else {
      mySvg.setAttribute('width', `${ORIGINAL_WIDTH / MM_TO_PX}mm`);
      mySvg.setAttribute('height', `${ORIGINAL_HEIGHT / MM_TO_PX}mm`);
      mySvg.childNodes.forEach((el) => {
        if (el.nodeName.toLowerCase() !== '#text') {
          const x1 = el?.getAttribute('x1');
          const x2 = el?.getAttribute('x2');
          const y1 = el?.getAttribute('y1');
          const y2 = el?.getAttribute('y2');
          if (x1 && x1 != '0mm') {
            el.setAttribute('x1', `${ORIGINAL_WIDTH / MM_TO_PX}mm`);
          }
          if (x2 && x2 != '0mm') {
            el.setAttribute('x2', `${ORIGINAL_WIDTH / MM_TO_PX}mm`);
          }
          if (y1 && y1 != '0mm') {
            el.setAttribute('y1', `${ORIGINAL_HEIGHT / MM_TO_PX}mm`);
          }
          if (y2 && y2 != '0mm') {
            el.setAttribute('y2', `${ORIGINAL_HEIGHT / MM_TO_PX}mm`);
          }
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Get the close button element
  const closeButton = document.getElementById('closeButton');
  const fullscreenButton = document.getElementById('fullscreenButton');

  // Attach a click event listener to the close button
  closeButton.addEventListener('click', () => {
    // Send a message to the main process to close the window
    ipcRenderer.send('close-window');
  });
  fullscreenButton.addEventListener('click', () => {
    ipcRenderer.send('toggle-fullscreen');
  });
  window.addEventListener('resize', adjustSize);
  // Elements
  const file = document.getElementById('file');
  const html = document.getElementById('html');
  const css = document.getElementById('css');
//   const json = document.getElementById('json');
  const style = document.getElementById('style');
  const fileContent = document.getElementById('file-content');
  main = document.getElementById('main');
  html.addEventListener('change', (e) => {
    if (e.target.checked) {
      fileContent.style.display = 'flex';
    } else {
      fileContent.style.display = 'none';
    }
  });
  const sanitizeFileContent = (fileContentDiv) => {
    let elem;
    for (let i = fileContentDiv.children.length - 1; i >= 0; i--) {
      const child = fileContentDiv.children[i];
      if (child.tagName.toLowerCase() === 'svg') {
        elem = child;
        break;
      }
    }
    fileContentDiv.innerHTML = '';
    elem.setAttribute('id', 'mySvg');
    fileContentDiv.appendChild(elem);
    ORIGINAL_WIDTH = elem.clientWidth;
    ORIGINAL_HEIGHT = elem.clientHeight;
    mySvg = document.getElementById('mySvg');
    adjustSize();
  };
  document.addEventListener('keydown', function (event) {
    // Check if the key combination is 'Ctrl + Shift + A'
    if (event.ctrlKey && event.key === 'o') {
      file.click();
    }
  });

  const readFiles = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const path = selectedFile.path;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        fileContent.innerHTML = content;
        sanitizeFileContent(fileContent);
        html.checked = true;
        html.disabled = false;
      };
      reader.readAsText(selectedFile);
      // Open associated CSS and JSON files
      // Read CSS file contents - Uncomment code below
      const cssFileName = path.replace(/\.html$/, '.css');
      fetch(cssFileName)
        .then((response) => response.text())
        .then((cssContents) => (style.innerHTML = cssContents))
        .catch(() => {
          css.disabled = true;
          css.checked = false;
        });

      // Read JSON file contents - Uncomment code below

      //   const jsonFileName = path.replace(/\.html$/, '.json');
      //   fetch(jsonFileName)
      //     .then((response) => response.text())
      //     .then((jsonContents) =>
      //       console.log(`${jsonFileName} Contents:\n${jsonContents}`)
      //     )
      //     .catch(() => {
      //       json.disabled = true;
      //       json.checked = false;
      //     });
    }
  };

  file.addEventListener('change', readFiles);
});
