# Create Installer

## Step 1: First need to install electron packager (GLOBALLY)
`npm i electron-packager -G`

## Step 2: Download WIX-Installer from following link:
`https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311.exe`

## Step 3: Install donwloaded wix311.exe

## Step 4: Set system environment variables:
- Go to This PC
- Right-Click and select Properties
- Select "Advanced system settings" from left pane
- Select "Environment Variables..." at the bottom right
- Under System variable, double-click on `Path`
- Click on `New` button in right column
- Paste this path: C:\Program Files (x86)\WiX Toolset v3.11\bin
- Click `OK` to close all setting windows

## Step 5: Goto project folder and run `make.bat` file.

Finally your installer will be created inside `build/` directory.