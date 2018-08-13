const electron = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const fs = require('fs-extra-promise');
const path = require('path');

const { app, BrowserWindow, ipcMain, Menu } = electron;
const { platform } = process;

require('electron-context-menu')();

// const handleError = err => {
//   console.error(err);
// };

const dataPath = app.getPath('userData');

app.on('ready', () => {

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  const appWindow = new BrowserWindow({
    show: false,
    width: width - 200,
    height: height - 200
  });

  appWindow.once('ready-to-show', () => {
    appWindow.show();
  });

  appWindow.loadURL(`file://${__dirname}/public/index.html`);

  if(platform === 'darwin') {
    const menuTemplate = [];
    // File Menu
    menuTemplate.push({
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    });
    // Edit Menu
    menuTemplate.push({
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    });
    // Window Menu
    if(isDev) {
      menuTemplate.push({
        label: 'Window',
        submenu: [
          { label: 'Show Dev Tools', role: 'toggledevtools' }
        ]
      });
    }
    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);
  }

  ipcMain.on('getVersion', e => {
    const { version } = fs.readJsonSync(path.join(__dirname, 'package.json'));
    e.returnValue = version;
  });
  ipcMain.on('getDataPath', e => {
    e.returnValue = dataPath;
  });

});

// Properly close the application
app.on('window-all-closed', () => {
  app.quit();
});

// Check for updates and automatically install
if(!isDev) autoUpdater.checkForUpdates();
