const { MSICreator } = require("electron-wix-msi");
const path = require("path");

const APP_DIR = path.resolve(__dirname, "./SketchValid8-win32-x64");
const OUT_DIR = path.resolve(__dirname, "./windows_installer");

const msiCreator = new MSICreator({
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,
  description: "CadifySketcher Validation Tool",
  exe: "SketchValid8",
  name: "SketchValid8",
  manufacturer: "CD_DEV_AR",
  version: "3.7.0",
  ui: {
    chooseDirectory: true,
  },
  upgradeCode: "9c71c51f-c3a2-4198-8011-82b9197e6e51",
  upgradeGuid: "9c71c51f-c3a2-4198-8011-82b9197e6e51",
});

// Add a shortcut to the Start Menu
// msiCreator.shortcuts = [
//   {
//     name: "SketchValid8", // Shortcut name
//     target: "[INSTALLDIR]\\SketchValid8.exe", // Path to the executable
//     description: "Launch SketchValid8", // Shortcut description
//     icon: "[INSTALLDIR]\\icon.ico", // Path to the icon file (optional)
//     directory: "ProgramMenuFolder", // Shortcut directory (e.g., ProgramMenuFolder or StartMenuFolder or DesktopFolder)
//   }
// ];

msiCreator.create().then(function () {
  msiCreator.compile();
});
