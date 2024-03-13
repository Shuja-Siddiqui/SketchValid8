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

msiCreator.create().then(function () {
  msiCreator.compile();
});
