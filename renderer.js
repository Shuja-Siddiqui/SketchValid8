const { ipcRenderer } = require("electron");
const MM_TO_PX = 3.7795275591;

// Globals
let mySvg;
let ORIGINAL_WIDTH;
let ORIGINAL_HEIGHT;
let main;
let cssFileContents;
let jsonFileContents;
let clonned;
let heightA1;
let widthA1;
let fileName = "";
const el_clonned = {};

const adjustGrid = (o_svg) => {
  let initialWidth = mmToPx(o_svg.getAttribute("width"));
  let initialHeight = mmToPx(o_svg.getAttribute("height"));
  let currentWidth = mySvg.getBoundingClientRect().width;
  let currentHeight = mySvg.getBoundingClientRect().height;
  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;
  const newWidth = isNaN(parseFloat(widthA1))
    ? 27.3
    : parseFloat(widthA1) * widthScaleFactor;
  const newHeight = isNaN(parseFloat(heightA1))
    ? 7
    : parseFloat(heightA1) * heightScaleFactor;
  const newFontSize = 32 * ((widthScaleFactor * heightScaleFactor) / 2);
  const elems = document.getElementsByClassName("grid-column");
  const elemsRow = document.getElementsByClassName("grid-row");
  for (let elem = 0; elem < elems.length; elem++) {
    elems[elem].style.width = `${newWidth}mm`;
    elems[elem].style.height = `${newHeight}mm`;
    elems[elem].style.fontSize = `${newFontSize}px`;
  }
  for (let elem = 0; elem < elemsRow.length; elem++) {
    elemsRow[elem].style.height = `${newHeight}mm`;
    elemsRow[elem].style.width = mySvg.getBoundingClientRect().width;
  }
  applyMerging("style");
};

const adjustSize = () => {
  const getUpdateFn = (shape) => {
    switch (shape) {
      case "circle":
        return updateCircleAttributes;
      case "rect":
        return updateRectAttributes;
      case "line":
        return updateLineAttributes;
      case "image":
        return updateImageAttributes;
      case "svg":
        return "recursion";
      default:
        return null;
    }
  };
  let isRecursive = false;
  const recursiveAdjust = (svg) => {
    svg.childNodes.forEach((el, index) => {
      if (el.nodeName.toLowerCase() !== "#text") {
        const fn = getUpdateFn(el.nodeName.toLowerCase());
        if (fn) {
          if (fn === "recursion") {
            isRecursive = true;
            if (!el_clonned[el.childNodes?.[1]?.getAttribute("id")]) {
              el_clonned[el.childNodes[1].getAttribute("id")] =
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
                  ? el_clonned[el.getAttribute("id")]
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
  if (mySvg && main?.clientWidth <= ORIGINAL_WIDTH) {
    mySvg.setAttribute("width", `${main?.clientWidth / MM_TO_PX}mm`);
    mySvg.setAttribute(
      "height",
      `${(main?.clientWidth * (ORIGINAL_HEIGHT / ORIGINAL_WIDTH)) / MM_TO_PX}mm`
    );
    recursiveAdjust(mySvg);
    adjustGrid(clonned);
  } else {
    try {
      mySvg.setAttribute("width", `${ORIGINAL_WIDTH / MM_TO_PX}mm`);
      mySvg.setAttribute("height", `${ORIGINAL_HEIGHT / MM_TO_PX}mm`);
      recursiveAdjust(mySvg);
      adjustGrid(mySvg);
    } catch (err) {
      console.log(err);
    }
  }
};

const makeGrid = () => {
  const grid = document.getElementById("grid");
  const chars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  let innerHTML = "";
  if (grid) {
    for (let row = 0; row < 47; row++) {
      innerHTML += `<div class="grid-row">`;
      for (let column = 0; column < 26; column++) {
        innerHTML += `<div class="grid-column ${chars[column]}${
          row + 1
        }"></div>`;
      }
      innerHTML += "</div>";
    }
    grid.innerHTML = innerHTML;
  }
};

const mmToPx = (mm) => {
  return ((mm?.split("mm")?.[0] || 0) * MM_TO_PX).toFixed(3);
};
const pxToMm = (mm) => ((mm || 0) / MM_TO_PX).toFixed(3);

function updateCircleAttributes(svg, o_svg, circle, o_circle) {
  let initialWidth = mmToPx(o_svg.getAttribute("width"));
  let initialHeight = mmToPx(o_svg.getAttribute("height"));
  let initialCX = mmToPx(o_circle.getAttribute("cx"));
  let initialCY = mmToPx(o_circle.getAttribute("cy"));
  let initialRadius = mmToPx(o_circle.getAttribute("r"));

  let currentWidth = svg.getBoundingClientRect().width;
  let currentHeight = svg.getBoundingClientRect().height;

  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  let newCX = initialCX * widthScaleFactor;
  let newCY = initialCY * heightScaleFactor;
  let newRadius = (initialRadius * (widthScaleFactor + heightScaleFactor)) / 2;

  circle.setAttribute("cx", pxToMm(newCX) + "mm");
  circle.setAttribute("cy", pxToMm(newCY) + "mm");
  circle.setAttribute("r", pxToMm(newRadius) + "mm");
  circle.setAttribute(
    "stroke-width",
    o_circle.getAttribute("stroke-width") *
      ((widthScaleFactor + heightScaleFactor) / 2)
  );
}

function updateRectAttributes(svg, o_svg, rect, o_rect) {
  let initialWidth = mmToPx(o_svg.getAttribute("width")); // initial width of SVG
  let initialHeight = mmToPx(o_svg.getAttribute("height")); // initial height of SVG
  let initialRX = mmToPx(o_rect.getAttribute("rx")); // initial CX of rect
  let initialRY = mmToPx(o_rect.getAttribute("ry")); // initial CY of rect
  let initialX = mmToPx(o_rect.getAttribute("x")); // initial CX of rect
  let initialY = mmToPx(o_rect.getAttribute("y")); // initial CY of rect
  let initialWidthR = mmToPx(o_rect.getAttribute("width")); // initial width of SVG
  let initialHeightR = mmToPx(o_rect.getAttribute("height")); // initial height of SVG
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

  rect.setAttribute("rx", pxToMm(newRX) + "mm");
  rect.setAttribute("ry", pxToMm(newRY) + "mm");
  rect.setAttribute("x", pxToMm(newX) + "mm");
  rect.setAttribute("y", pxToMm(newY) + "mm");
  rect.setAttribute("width", pxToMm(newWidth) + "mm");
  rect.setAttribute("height", pxToMm(newHeight) + "mm");
  rect.setAttribute(
    "stroke-width",
    o_rect.getAttribute("stroke-width") *
      ((widthScaleFactor + heightScaleFactor) / 2)
  );
}

function updateImageAttributes(svg, o_svg, image, o_image) {
  let initialWidth = mmToPx(o_svg.getAttribute("width"));
  let initialHeight = mmToPx(o_svg.getAttribute("height"));
  let initialX = mmToPx(o_image.getAttribute("x"));
  let initialY = mmToPx(o_image.getAttribute("y"));
  let initialWidthR = mmToPx(o_image.getAttribute("width"));
  let initialHeightR = mmToPx(o_image.getAttribute("height"));

  let currentWidth = mySvg.getBoundingClientRect().width;
  let currentHeight = mySvg.getBoundingClientRect().height;

  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  let newX = initialX * widthScaleFactor;
  let newY = initialY * heightScaleFactor;
  let newWidth = initialWidthR * widthScaleFactor;
  let newHeight = initialHeightR * heightScaleFactor;

  image.setAttribute("x", pxToMm(newX) + "mm");
  image.setAttribute("y", pxToMm(newY) + "mm");
  image.setAttribute("width", pxToMm(newWidth) + "mm");
  image.setAttribute("height", pxToMm(newHeight) + "mm");
  // get transform attribute from svg image tag
  if (image.getAttribute("transform")) {
    // extract degree value from transform tag
    const degree =
      image
        ?.getAttribute("transform")
        ?.split("rotate(")
        ?.join("")
        ?.split(",")?.[0] || 0;
    // set degree & newX & newY to resize image and rotate at same time
    image.setAttribute("transform", `rotate(${degree}, ${newX}, ${newY})`);
  }
}

function updateLineAttributes(svg, o_svg, line, o_line) {
  let initialWidth = mmToPx(o_svg.getAttribute("width"));
  let initialHeight = mmToPx(o_svg.getAttribute("height"));
  let initialX1 = mmToPx(o_line.getAttribute("x1"));
  let initialY1 = mmToPx(o_line.getAttribute("y1"));
  let initialX2 = mmToPx(o_line.getAttribute("x2"));
  let initialY2 = mmToPx(o_line.getAttribute("y2"));

  let currentWidth = svg.getBoundingClientRect().width;
  let currentHeight = svg.getBoundingClientRect().height;

  let widthScaleFactor = currentWidth / initialWidth;
  let heightScaleFactor = currentHeight / initialHeight;

  let newX1 = initialX1 * widthScaleFactor;
  let newY1 = initialY1 * heightScaleFactor;
  let newX2 = initialX2 * widthScaleFactor;
  let newY2 = initialY2 * heightScaleFactor;

  line.setAttribute("x1", pxToMm(newX1) + "mm");
  line.setAttribute("y1", pxToMm(newY1) + "mm");
  line.setAttribute("x2", pxToMm(newX2) + "mm");
  line.setAttribute("y2", pxToMm(newY2) + "mm");
  line.setAttribute(
    "stroke-width",
    o_line.getAttribute("stroke-width") *
      ((widthScaleFactor + heightScaleFactor) / 2)
  );
}

function runJs(code) {
  /**
   * @param {String} code - JS Code
   * Convert string to JS function and run it
   */
  const runCode = new Function(code);
  runCode();
}

function applyMerging(styleId) {
  /**
   * Fetch all grid columns
   * */
  const styleContent = document.getElementById(styleId).textContent;

  // Regex to match class names and their background color
  const classWithPropertiesRegex =
    /\.([A-Za-z0-9_\-]+)::?before\s*\{([^}]*)\}/g;

  let match;
  while ((match = classWithPropertiesRegex.exec(styleContent)) !== null) {
    const className = match[1];
    const properties = match[2];
    const elements = document.querySelectorAll(`.${className}`);
    let columnLetter;
    let rowNumber;
    let nextColumnLetter;

    elements.forEach((element) => {
      // Check if the style includes grid-column: span 2 or grid-row: span 1
      if (
        properties.includes("grid-column: span 2") ||
        properties.includes("grid-row: span 1")
      ) {
        const className = element.classList[1]; // Assuming the class name follows the format 'A1', 'B1', etc.
        columnLetter = className.charAt(0);
        rowNumber = parseInt(className.substring(1));

        // Calculate the next column letter
        nextColumnLetter = String.fromCharCode(columnLetter.charCodeAt(0) + 1);
        // Merge the current column and the next column
        setTimeout(() => {
          mergeCells(columnLetter, nextColumnLetter, rowNumber);
        }, 0);
      }
    });
  }
}

function mergeCells(baseColumnLetter, targetColumnLetter, rowNumber) {
  const baseCellId = `${baseColumnLetter}${rowNumber}`;
  const targetCellId = `${targetColumnLetter}${rowNumber}`;
  const baseCell = document.querySelector(`.${baseCellId}`);
  const targetCell = document.querySelector(`.${targetCellId}`);
  const elementA1 = document.querySelector(".grid-column.A1");
  const width = parseFloat(elementA1?.style?.width);
  const newWidth = width * 2;

  if (baseCell && targetCell) {
    // Optionally, combine the content of the two cells
    baseCell.textContent += ` ${targetCell.textContent}`;

    // Adjust the styling to visually merge them
    // For example, by increasing the width and hiding the border of one cell
    baseCell.style.width = `${newWidth}mm`; // Assuming each cell is 27.3mm
    baseCell.classList.add("merged-cell"); // You might want to add specific styling for merged cells

    // Remove or hide the target cell
    targetCell.style.display = "none"; // Hide the cell
    // targetCell.remove(); // Or remove the cell entirely if not needed
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Get the close button element
  const closeButton = document.getElementById("closeButton");
  const fullscreenButton = document.getElementById("fullscreenButton");

  // Attach a click event listener to the close button
  closeButton.addEventListener("click", () => {
    // Send a message to the main process to close the window
    ipcRenderer.send("close-window");
  });
  fullscreenButton.addEventListener("click", () => {
    ipcRenderer.send("toggle-fullscreen");
  });
  window.addEventListener("resize", adjustSize);

  // DOM Elements
  const file = document.getElementById("file");
  const html = document.getElementById("html");
  const css = document.getElementById("css");
  const json = document.getElementById("json");
  const style = document.getElementById("style");
  const script = document.getElementById("script");
  const fileContent = document.getElementById("file-content");
  let resData;
  main = document.getElementById("main");

  // Reset value every time
  file.onclick = function () {
    this.value = null;
  };

  // Toggle for HTML content
  html.addEventListener("change", (e) => {
    if (e.target.checked) {
      fileContent.style.display = "flex";
    } else {
      fileContent.style.display = "none";
    }
  });

  // Toggle for CSS content
  css.addEventListener("change", (e) => {
    if (e.target.checked) {
      style.innerHTML = cssFileContents;
      // Call function to add inline styles to class
      applyBackgroundColorsFromStyle("style");
      // If css is checked then json enabled
      json.disabled = false;
    } else {
      style.innerHTML = "";
      // If css is not checked then json should be unchecked and disabled
      json.checked = false;
      json.disabled = true;
      script.innerHTML = "";
      insertDataIntoDivs();
      // Call function to remove inline styles of class
      removeAppliedCSS();
      updateBgDefault();
    }
  });

  // Toggle for JSON content
  json.addEventListener("change", (e) => {
    if (e.target.checked) {
      script.innerHTML = jsonFileContents;
      insertDataIntoDivs();
      // resData = jsonFileContents;
    } else {
      script.innerHTML = "";
      insertDataIntoDivs();
      // resData = [];
    }
  });
  const fs = require("fs");
  let prevContent;
  let newPath;
  let prevPath;
  let prevStyle;
  let prevCssPath;
  let prevJson;

  // Listen for the 'file-changed' event from the main process
  ipcRenderer.on("file-changed", async (event, path) => {
    newPath = path;
    const pathToFile = path.replace("file:\\\\", "");
    // Read File and detect changes in prev and new file
    fs.readFile(pathToFile, "utf8", (err, contents) => {
      if (err) {
        console.log(err);
        return;
      }
      // console.log("update", contents);
      // console.log("html condition", prevContent === contents);
      if (prevContent !== contents) {
        readFiles(prevPath);
      }
    });
    // Call change event programmatically
    file.addEventListener("change", readFiles);
  });

  // Listen for the 'css-changed' event from the main process
  ipcRenderer.on("css-changed", async (event, path) => {
    const pathToFile = path.replace("file:\\\\", "");
    // Read File and detect changes in prev and new file
    fs.readFile(pathToFile, "utf8", (err, contents) => {
      if (err) {
        console.log(err);
        return;
      }
      if (prevStyle !== contents) {
        readFiles(prevPath);
      }
    });

    // file.addEventListener("change", readFiles);
  });

  // Listen for the 'json-changed' event from the main process
  ipcRenderer.on("json-changed", async (event, path) => {
    const pathToFile = path.replace("file:\\\\", "");
    // Read File and detect changes in prev and new file
    fs.readFile(pathToFile, "utf8", (err, contents) => {
      if (err) {
        console.log(err);
        return;
      }
      if (prevJson !== contents) {
        readFiles(prevPath);
      }
    });

    file.addEventListener("change", readFiles);
  });

  function removeDynamicStyles() {
    // Select all <style> elements with the class 'dynamic-style' and remove them
    document.querySelectorAll("style.dynamic-style").forEach((style) => {
      style.remove();
    });
  }

  function insertDataIntoDivs() {
    /**
     * Handle Json file
     * Apply formatting
     * Apply updated content
     * */

    // First, remove all dynamically added styles
    removeDynamicStyles();
    // Apply Conditions
    if (script.innerHTML.length !== 0) {
      resData = JSON.parse(script.innerHTML);
      resData?.data.map((event) => {
        // Search element by its className
        var div = document.getElementsByClassName(event.ref);
        // Special condition for A1
        if (event.ref === "A1" && div) {
          const style = document.createElement("style");
          style.className = "dynamic-style"; // Add this line
          // Update styling of css file
          if (event.format !== undefined && event.format !== "") {
            style.textContent = `.${event.ref}::before {${event.format}};`;
            // Append the style rule to the document's head
            document.head.appendChild(style);
          }
        }
        // Condition for other elements
        if (div) {
          const style = document.createElement("style");
          style.className = "dynamic-style"; // Add this line
          // Update styling of css file
          if (event.content !== undefined && event.content !== "") {
            style.textContent = `.${event.ref}::before {content: '${event.content}';}`;
            // Append the style rule to the document's head
            document.head.appendChild(style);
          }
        }
      });
    }

    if (script.innerHTML.length == 0 && resData?.data.length > 0) {
      const stylesToRemove = [];
      // populate class names to be removed
      resData?.data.forEach((e) => {
        if (e?.ref === "A1") {
          // If ref is "A1", push a specific format and content into stylesToRemove
          stylesToRemove.push(`.${e.ref}::before {${e.format}};`);
          // stylesToRemove.push(`.${e.ref}::before {content: '${e.content}';}`);
        } else {
          // For all other refs, push a content-based style into stylesToRemove
          stylesToRemove.push(`.${e.ref}::before {content: '${e.content}';}`);
        }
        if (e?.ref === "A1" && e?.content != "") {
          stylesToRemove.push(`.${e.ref}::before {content: '${e.content}';}`);
        }
      });

      // Loop through the styles to remove
      stylesToRemove.forEach((styleContent) => {
        // Find the <style> element with matching content
        const styleElement = [...document.querySelectorAll("style")].find(
          (style) => style.textContent.trim() === styleContent
        );
        // If found, remove the <style> element
        if (styleElement) {
          styleElement.remove();
        }
      });
    }
  }

  function removeJsonStyle() {
    if (script.innerHTML.length == 0 && resData?.data.length > 0) {
      console.log("remove");
      const stylesToRemove = [];
      // populate class names to be removed
      resData?.data.forEach((e) => {
        if (e?.ref === "A1") {
          // If ref is "A1", push a specific format and content into stylesToRemove
          stylesToRemove.push(`.${e.ref}::before {${e.format}};`);
          // stylesToRemove.push(`.${e.ref}::before {content: '${e.content}';}`);
        } else {
          // For all other refs, push a content-based style into stylesToRemove
          stylesToRemove.push(`.${e.ref}::before {content: '${e.content}';}`);
        }
        if (e?.ref === "A1" && e?.content != "") {
          stylesToRemove.push(`.${e.ref}::before {content: '${e.content}';}`);
        }
      });

      // Loop through the styles to remove
      stylesToRemove.forEach((styleContent) => {
        // Find the <style> element with matching content
        const styleElement = [...document.querySelectorAll("style")].find(
          (style) => style.textContent.trim() === styleContent
        );
        // If found, remove the <style> element
        // if (styleElement) {
        // console.log("styleElement", styleElement);
        styleElement.remove();
        // }
      });
    }
  }

  function appendCss() {
    /**
     * Apply updated css
     * */
    console.log("style", style);
    const elementB2 = document.querySelector(".grid-column.B2");
    console.log(elementB2);
    elementB2.style.backgroundColor = "red";
  }

  function mergeCells(baseColumnLetter, targetColumnLetter, rowNumber) {
    const baseCellId = `${baseColumnLetter}${rowNumber}`;
    const targetCellId = `${targetColumnLetter}${rowNumber}`;
    const baseCell = document.querySelector(`.${baseCellId}`);
    const targetCell = document.querySelector(`.${targetCellId}`);
    const elementA1 = document.querySelector(".grid-column.A1");
    const width = parseFloat(elementA1?.style?.width);
    const newWidth = width * 2;

    if (baseCell && targetCell) {
      // Optionally, combine the content of the two cells
      baseCell.textContent += ` ${targetCell.textContent}`;

      // Adjust the styling to visually merge them
      // For example, by increasing the width and hiding the border of one cell
      baseCell.style.width = `${newWidth}mm`; // Assuming each cell is 27.3mm
      baseCell.classList.add("merged-cell"); // You might want to add specific styling for merged cells

      // Remove or hide the target cell
      targetCell.style.display = "none"; // Hide the cell
      // targetCell.remove(); // Or remove the cell entirely if not needed
    }
  }

  let originalCSS = {};

  function applyBackgroundColorsFromStyle(styleId) {
    /**
     * Apply updated css using inline style
     * */
    // Extract styles from the <style> tag
    const styleContent = document.getElementById(styleId).textContent;

    // Regex to match class names and their background color
    // const classRegex = /\.([A-Za-z0-9_\-]+)/g;
    const classWithPropertiesRegex =
      /\.([A-Za-z0-9_\-]+)::?before\s*\{([^}]*)\}/g;

    let match;
    while ((match = classWithPropertiesRegex.exec(styleContent)) !== null) {
      const className = match[1];
      const properties = match[2];
      const elements = document.querySelectorAll(`.${className}`);
      const elems = document.getElementsByClassName("grid-column");
      const elemsRow = document.getElementsByClassName("grid-row");
      // get height and width from A1
      const elementA1 = document.querySelector(".grid-column.A1");
      widthA1 = elementA1?.style?.width;
      heightA1 = elementA1?.style?.height;
      let columnLetter;
      let rowNumber;
      let nextColumnLetter;

      // Apply A1 height and width on all Grid columns
      for (let elem = 0; elem < elems.length; elem++) {
        elems[elem].style.width = elementA1?.style?.width;
        elems[elem].style.height = elementA1?.style?.height;
      }

      // Apply A1 height Grid Rows
      for (let elem = 0; elem < elemsRow.length; elem++) {
        elemsRow[elem].style.height = elementA1?.style?.height;
      }

      elements.forEach((element) => {
        // Store the original CSS properties
        if (!originalCSS[className]) {
          originalCSS[className] = {};
        }
        Object.assign(originalCSS[className], element.style);

        // Apply background color to the element
        element.style = properties;
      });

      elements.forEach((element) => {
        // Check if the style includes grid-column: span 2 or grid-row: span 1
        if (
          properties.includes("grid-column: span 2") ||
          properties.includes("grid-row: span 1")
        ) {
          const className = element.classList[1]; // Assuming the class name follows the format 'A1', 'B1', etc.
          columnLetter = className.charAt(0);
          rowNumber = parseInt(className.substring(1));

          // Calculate the next column letter
          nextColumnLetter = String.fromCharCode(
            columnLetter.charCodeAt(0) + 1
          );
          // Merge the current column and the next column
          setTimeout(() => {
            // merge cells
            mergeCells(columnLetter, nextColumnLetter, rowNumber);
          }, 0);
        }
      });
      // mergeCells("B", "C", 2);
    }

    // Chaining Background Color && BorderColor
    const elems = document.getElementsByClassName("grid-column");
    for (let elem = 1; elem < elems.length; elem++) {
      prevBackground = getComputedStyle(elems[elem - 1]).backgroundColor;
      prevBorder = getComputedStyle(elems[elem - 1]).borderColor;
      // Apply Background color
      if (
        (!elems[elem].style.background ||
          elems[elem].style.background == "rgba(0, 0, 0, 0)") &&
        elem !== 0
      ) {
        elems[elem].style.background = prevBackground;
      }

      // Apply BorderColor
      if (
        (!elems[elem].style.borderColor ||
          elems[elem].style.borderColor === "rgb(221, 221, 221)") &&
        prevBorder !== "rgb(0, 0, 0)"
      ) {
        elems[elem].style.borderColor = prevBorder;
      }
    }

    // Set A1 height and width Again for all columns
    const elementA1 = document.querySelector(".grid-column.A1");
    for (let elem = 0; elem < elems.length; elem++) {
      elems[elem].style.width = elementA1?.style?.width;
      elems[elem].style.height = elementA1?.style?.height;
    }
  }

  function updateBgDefault() {
    const elems = document.getElementsByClassName("grid-column");
    // Set bg color to transparent
    for (let elem = 0; elem < elems.length; elem++) {
      elems[elem].style.background = "rgba(0, 0, 0, 0)";
    }

    // Set border color to Default
    for (let elem = 0; elem < elems.length; elem++) {
      elems[elem].style.borderColor = "rgb(221, 221, 221)";
    }
  }

  function removeAppliedCSS() {
    /**
     * Remove updated css from inline style
     * */
    // Iterate over stored class names and remove applied CSS properties
    Object.keys(originalCSS).forEach((className) => {
      const originalProperties = originalCSS[className];
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach((element) => {
        // Remove each applied CSS property individually, except for height and width
        Object.keys(originalProperties).forEach((property) => {
          if (property !== "height" && property !== "width") {
            // Skip height and width
            element.style.removeProperty(property);
          }
        });
      });
    });

    // Clear the stored original CSS properties
    originalCSS = {};
  }

  const setOriginalScale = (width, height) => {
    /**
     * @param {Number} width - Original width of screen
     * @param {Number} height - Original height of screen
     * Set original width and height of screen in global ORIGINAL_WIDTH and ORIGINAL_HEIGHT variables
     */
    ORIGINAL_WIDTH = width;
    ORIGINAL_HEIGHT = height;
  };

  const loadSvg = (htmlElement, svg) => {
    /**
     * @param {HTMLElement} htmlElement - Container
     * @param {HTMLElement} svg - SVG Image
     * Loads SVG in container and set it's id to "mySvg"
     */
    htmlElement.innerHTML = "";
    svg.setAttribute("id", "mySvg");
    htmlElement.appendChild(svg);
  };

  const sanitizeFileContent = (htmlElement) => {
    /**
     * @param {HTMLElement} htmlElement - Container
     * Removes unnecessary tags like text, html and then opens scaled file
     */
    let elem;
    for (let i = htmlElement.children.length - 1; i >= 0; i--) {
      const child = htmlElement.children[i];
      if (child.tagName.toLowerCase() === "svg") {
        elem = child;
        break;
      }
    }
    for (let i = htmlElement.children.length - 1; i >= 0; i--) {
      const child = htmlElement.children[i];
      if (child.tagName.toLowerCase() === "script") {
        const code = child.innerHTML;
        // runJs(code);
      }
    }
    loadSvg(htmlElement, elem);
    setOriginalScale(elem.clientWidth, elem.clientHeight);
    mySvg = document.getElementById("mySvg");
    clonned = mySvg.cloneNode(true);
    adjustSize();
  };

  // If the key combination is 'Ctrl + Shift + O' then open the file browser
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "o") {
      file.click();
    }
  });

  const readFiles = (e) => {
    if (e?.target?.files?.length > 0) {
      prevPath = e;
      const selectedFile = e.target.files[0];
      selectedFile.value = "";
      const path = selectedFile.path;
      const fileNameOnly = path.match(/([^\\]+)\.\w+$/)[1];
      // check if file name is changed
      // if (fileName !== "") {
      //   if (fileName !== fileNameOnly) {
      //     console.log("reset dom");
      //     // fileContent.innerHTML = "";
      //     // style.innerHTML = "";
      //     script.innerHTML = "";
      //     // reset file name to default
      //     fileName = "";
      //   }
      // } else {
      //   // set file name
      //   fileName = fileNameOnly;
      // }
      const reader = new FileReader();
      reader.onload = (e) => {
        makeGrid();
        const content = e.target.result;
        fileContent.innerHTML = content;
        prevContent = content;
        sanitizeFileContent(fileContent);
        html.checked = true;
        html.disabled = false;

        // After reading and processing the html file
        ipcRenderer.send("watch-file", path);
      };
      reader.readAsText(selectedFile);

      // Open associated CSS file
      const cssFileName = path.replace(/\.html$/, ".css");
      fetch(cssFileName)
        .then((response) => response.text())
        .then((cssContents) => {
          cssFileContents = cssContents;
          style.innerHTML = cssFileContents;
          // Call function to add inline styles to class
          applyBackgroundColorsFromStyle("style");
          prevStyle = cssFileContents;
          css.checked = true;
          css.disabled = false;

          // After reading and processing the css file
          ipcRenderer.send("watch-css", cssFileName);
        })
        .catch(() => {
          css.disabled = true;
          css.checked = false;
        });
      // Empty script tag for the first time
      // script.innerHTML = "";
      // insertDataIntoDivs();
      // removeJsonStyle();

      // Open associated JSON file
      const jsonFileName = path.replace(/\.html$/, ".json");
      fetch(jsonFileName)
        .then((response) => response.text())
        .then((jsonContents) => {
          // If their is no css styling then dont display json content
          if (style.innerHTML != "") {
            jsonFileContents = jsonContents;
            script.innerHTML = "";
            script.innerHTML = jsonFileContents;
            prevJson = jsonFileContents;
            insertDataIntoDivs();
            json.checked = true;
            json.disabled = false;
            ipcRenderer.send("watch-json", jsonFileName);
          }
        })
        .catch(() => {
          json.disabled = true;
          json.checked = false;
        });
    }
  };

  file.addEventListener("change", readFiles);
});
