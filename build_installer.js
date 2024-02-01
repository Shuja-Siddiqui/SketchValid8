const { MSICreator } = require('electron-wix-msi');
const path = require('path');

const APP_DIR = path.resolve(__dirname, './SketchValid8-win32-x64');
const OUT_DIR = path.resolve(__dirname, './windows_installer');

const msiCreator = new MSICreator({
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,
  description: 'CadifySketcher Validation Tool',
  exe: 'SketchValid8',
  name: 'SketchValid8',
  manufacturer: 'CD_DEV_AR',
  version: '1.0.0',
  ui: {
    chooseDirectory: true,
  },
});

msiCreator.create().then(function () {
  msiCreator.compile();
});
