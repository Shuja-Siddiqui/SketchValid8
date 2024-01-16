const { MSICreator } = require("electron-wix-msi");
const path = require("path");
const APP_DIR = path.resolve(__dirname, "./out/sketchvalid8-win32-x64");
const OUT_DIR = path.resolve(__dirname, "./build");

// Step 1: Instantiate the MSICreator
async function createMSI() {
  const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    description: "My amazing simulator",
    exe: "sketchvalid8",
    name: "sketchvalid8",
    manufacturer: "Technologies",
    version: "1.1.2",
    outputDirectory: OUT_DIR,
  });

  // Step 2: Create a .wxs template file
  const supportBinaries = await msiCreator.create();

  if (Array.isArray(supportBinaries)) {
    for (const binary of supportBinaries) {
      await signFile(binary);
    }
  } else {
    console.error('Unexpected format for supportBinaries. Expected an array.');
  }

  // Step 3: Compile the template to a .msi file
  await msiCreator.compile();
}

createMSI()
  .then(() => {
    console.log("MSI created successfully.");
  })
  .catch((error) => {
    console.error("Error creating MSI:", error);
  });
