const { ipcRenderer } = require('electron');
const MM_TO_PX = 3.7795275591;
let mySvg;
let ORIGINAL_WIDTH;
let ORIGINAL_HEIGHT;
let main;
let cssFileContents;
let clonned;
const el_clonned = {};

const adjustGrid = (o_svg) => {
  let initialWidth = mmToPx(o_svg.getAttribute('width'));
  let initialHeight = mmToPx(o_svg.getAttribute('height'));
  let currentWidth = mySvg.getBoundingClientRect().width;
  let currentHeight = mySvg.getBoundingClientRect().height;
  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;
  const newWidth = 27.3 * widthScaleFactor;
  const newHeight = 7 * heightScaleFactor;
  const newFontSize = 32 * ((widthScaleFactor * heightScaleFactor) / 2);
  const elems = document.getElementsByClassName('grid-column');
  const elemsRow = document.getElementsByClassName('grid-row');
  for (let elem = 0; elem < elems.length; elem++) {
    elems[elem].style.width = `${newWidth}mm`;
    elems[elem].style.height = `${newHeight}mm`;
    elems[elem].style.fontSize = `${newFontSize}px`;
  }
  for (let elem = 0; elem < elemsRow.length; elem++) {
    elemsRow[elem].style.height = `${newHeight}mm`;
  }
};

const adjustSize = () => {
  const getUpdateFn = (shape) => {
    switch (shape) {
      case 'circle':
        return updateCircleAttributes;
      case 'rect':
        return updateRectAttributes;
      case 'line':
        return updateLineAttributes;
      case 'image':
        return updateImageAttributes;
      case 'svg':
        return 'recursion';
      default:
        return null;
    }
  };
  let isRecursive = false;
  const recursiveAdjust = (svg) => {
    svg.childNodes.forEach((el, index) => {
      if (el.nodeName.toLowerCase() !== '#text') {
        const fn = getUpdateFn(el.nodeName.toLowerCase());
        if (fn) {
          if (fn === 'recursion') {
            isRecursive = true;
            if (!el_clonned[el.childNodes?.[1]?.getAttribute('id')]) {
              el_clonned[el.childNodes[1].getAttribute('id')] =
                el.childNodes[1].cloneNode(true);
            }
            recursiveAdjust(el);
          } else {
            try {
              fn(
                svg,
                clonned,
                el,
                isRecursive
                  ? el_clonned[el.getAttribute('id')]
                  : clonned.childNodes[index]
              );
              isRecursive = false;
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    });
  };
  if (mySvg) {
    mySvg.setAttribute('width', `${main?.clientWidth / MM_TO_PX}mm`);
    mySvg.setAttribute(
      'height',
      `${(main?.clientWidth * (ORIGINAL_HEIGHT / ORIGINAL_WIDTH)) / MM_TO_PX}mm`
    );
    adjustGrid(clonned);
    recursiveAdjust(mySvg);
  }
};

const makeGrid = () => {
  const grid = document.getElementById('grid');
  const chars = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  let innerHTML = '';
  if (grid) {
    for (let row = 0; row < 47; row++) {
      innerHTML += `<div class="grid-row">`;
      for (let column = 0; column < 26; column++) {
        innerHTML += `<div class="grid-column ${chars[column]}${
          row + 1
        }"></div>`;
      }
      innerHTML += '</div>';
    }
    grid.innerHTML = innerHTML;
  }
};

const mmToPx = (mm) => {
  return ((mm?.split('mm')?.[0] || 0) * MM_TO_PX).toFixed(3);
};
const pxToMm = (mm) => ((mm || 0) / MM_TO_PX).toFixed(3);

function updateCircleAttributes(svg, o_svg, circle, o_circle) {
  let initialWidth = mmToPx(o_svg.getAttribute('width'));
  let initialHeight = mmToPx(o_svg.getAttribute('height'));
  let initialCX = mmToPx(o_circle.getAttribute('cx'));
  let initialCY = mmToPx(o_circle.getAttribute('cy'));
  let initialRadius = mmToPx(o_circle.getAttribute('r'));

  let currentWidth = svg.getBoundingClientRect().width;
  let currentHeight = svg.getBoundingClientRect().height;

  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  let newCX = initialCX * widthScaleFactor;
  let newCY = initialCY * heightScaleFactor;
  let newRadius = (initialRadius * (widthScaleFactor + heightScaleFactor)) / 2;

  circle.setAttribute('cx', pxToMm(newCX) + 'mm');
  circle.setAttribute('cy', pxToMm(newCY) + 'mm');
  circle.setAttribute('r', pxToMm(newRadius) + 'mm');
  circle.setAttribute(
    'stroke-width',
    o_circle.getAttribute('stroke-width') *
      ((widthScaleFactor + heightScaleFactor) / 2)
  );
}

function updateRectAttributes(svg, o_svg, rect, o_rect) {
  let initialWidth = mmToPx(o_svg.getAttribute('width')); // initial width of SVG
  let initialHeight = mmToPx(o_svg.getAttribute('height')); // initial height of SVG
  let initialRX = mmToPx(o_rect.getAttribute('rx')); // initial CX of rect
  let initialRY = mmToPx(o_rect.getAttribute('ry')); // initial CY of rect
  let initialX = mmToPx(o_rect.getAttribute('x')); // initial CX of rect
  let initialY = mmToPx(o_rect.getAttribute('y')); // initial CY of rect
  let initialWidthR = mmToPx(o_rect.getAttribute('width')); // initial width of SVG
  let initialHeightR = mmToPx(o_rect.getAttribute('height')); // initial height of SVG
  // Get the current width and height of the SVG
  let currentWidth = svg.getBoundingClientRect().width;
  let currentHeight = svg.getBoundingClientRect().height;

  // Calculate the scaling factor for the rect
  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  // Update the rect attributes
  let newRX = initialRX * widthScaleFactor;
  let newRY = initialRY * heightScaleFactor;
  let newX = initialX * widthScaleFactor;
  let newY = initialY * heightScaleFactor;
  let newWidth = initialWidthR * widthScaleFactor;
  let newHeight = initialHeightR * heightScaleFactor;

  rect.setAttribute('rx', pxToMm(newRX) + 'mm');
  rect.setAttribute('ry', pxToMm(newRY) + 'mm');
  rect.setAttribute('x', pxToMm(newX) + 'mm');
  rect.setAttribute('y', pxToMm(newY) + 'mm');
  rect.setAttribute('width', pxToMm(newWidth) + 'mm');
  rect.setAttribute('height', pxToMm(newHeight) + 'mm');
  rect.setAttribute(
    'stroke-width',
    o_rect.getAttribute('stroke-width') *
      ((widthScaleFactor + heightScaleFactor) / 2)
  );
}

function updateImageAttributes(svg, o_svg, image, o_image) {
  let initialWidth = mmToPx(o_svg.getAttribute('width'));
  let initialHeight = mmToPx(o_svg.getAttribute('height'));
  let initialX = mmToPx(o_image.getAttribute('x'));
  let initialY = mmToPx(o_image.getAttribute('y'));
  let initialWidthR = mmToPx(o_image.getAttribute('width'));
  let initialHeightR = mmToPx(o_image.getAttribute('height'));

  let currentWidth = mySvg.getBoundingClientRect().width;
  let currentHeight = mySvg.getBoundingClientRect().height;

  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  let newX = initialX * widthScaleFactor;
  let newY = initialY * heightScaleFactor;
  let newWidth = initialWidthR * widthScaleFactor;
  let newHeight = initialHeightR * heightScaleFactor;

  image.setAttribute('x', pxToMm(newX) + 'mm');
  image.setAttribute('y', pxToMm(newY) + 'mm');
  image.setAttribute('width', pxToMm(newWidth) + 'mm');
  image.setAttribute('height', pxToMm(newHeight) + 'mm');
}

function updateLineAttributes(svg, o_svg, line, o_line) {
  let initialWidth = mmToPx(o_svg.getAttribute('width'));
  let initialHeight = mmToPx(o_svg.getAttribute('height'));
  let initialX1 = mmToPx(o_line.getAttribute('x1'));
  let initialY1 = mmToPx(o_line.getAttribute('y1'));
  let initialX2 = mmToPx(o_line.getAttribute('x2'));
  let initialY2 = mmToPx(o_line.getAttribute('y2'));

  let currentWidth = svg.getBoundingClientRect().width;
  let currentHeight = svg.getBoundingClientRect().height;

  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  let newX1 = initialX1 * widthScaleFactor;
  let newY1 = initialY1 * heightScaleFactor;
  let newX2 = initialX2 * widthScaleFactor;
  let newY2 = initialY2 * heightScaleFactor;

  line.setAttribute('x1', pxToMm(newX1) + 'mm');
  line.setAttribute('y1', pxToMm(newY1) + 'mm');
  line.setAttribute('x2', pxToMm(newX2) + 'mm');
  line.setAttribute('y2', pxToMm(newY2) + 'mm');
  line.setAttribute(
    'stroke-width',
    o_line.getAttribute('stroke-width') *
      ((widthScaleFactor + heightScaleFactor) / 2)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  makeGrid();
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
  css.addEventListener('change', (e) => {
    if (e.target.checked) {
      style.innerHTML = cssFileContents;
    } else {
      style.innerHTML = '';
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
    for (let i = fileContentDiv.children.length - 1; i >= 0; i--) {
      const child = fileContentDiv.children[i];
      if (child.tagName.toLowerCase() === 'script') {
        document.body.appendChild(child);
        break;
      }
    }
    fileContentDiv.innerHTML = '';
    elem.setAttribute('id', 'mySvg');
    fileContentDiv.appendChild(elem);
    ORIGINAL_WIDTH = elem.clientWidth;
    ORIGINAL_HEIGHT = elem.clientHeight;
    mySvg = document.getElementById('mySvg');
    clonned = mySvg.cloneNode(true);
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
      const cssFileName = path.replace(/\.html$/, '.css');
      fetch(cssFileName)
        .then((response) => response.text())
        .then((cssContents) => {
          cssFileContents = cssContents;
          style.innerHTML = cssFileContents;
          css.checked = true;
          css.disabled = false;
        })
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
