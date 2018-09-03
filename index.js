const electron = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const fs = require('fs-extra-promise');
const path = require('path');

const { app, BrowserWindow, ipcMain, Menu } = electron;
const { platform } = process;

require('electron-context-menu')();

const handleError = err => {
  console.error(err);
};
ipcMain.on('handleError', (e, err) => handleError(err));

const dataPath = app.getPath('userData');

let videoWindows = [];

app.on('ready', () => {

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  const seederWindow = new BrowserWindow({
    show: false
  });
  seederWindow.loadURL(`file://${__dirname}/public/seeder.html`);
  // if(isDev) seederWindow.toggleDevTools();

  const appWindow = new BrowserWindow({
    show: false,
    width: width - 200,
    height: height - 150
  });

  appWindow.once('ready-to-show', () => {
    appWindow.show();
    // if(isDev) appWindow.toggleDevTools();
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
  ipcMain.on('getTorrentPath', e => {
    e.returnValue = path.join(app.getPath('home'), '.bitchute-desktop-temp');
  });
  ipcMain.on('seederInitialized', () => {
    appWindow.send('seederInitialized');
  });
  ipcMain.on('setMagnets', (e, magnets) => {
    seederWindow.send('setMagnets', magnets);
  });
  appWindow.on('close', () => {
    seederWindow.close();
    videoWindows.forEach(w => w.close());
  });

  ipcMain.on('playVideo', (e, video) => {
    ipcMain.once('localFiles', (ee, files = []) => {
      const videoWindow = new BrowserWindow({
        width: 873,
        height: 519,
        show: false
      });
      videoWindows.push(videoWindow);
      videoWindow.setMenu(null);
      videoWindow.loadURL(`file://${__dirname}/public/player.html`);
      // if(isDev) videoWindow.toggleDevTools();
      videoWindow.once('ready-to-show', () => {
        videoWindow.show();
      });
      ipcMain.once('getVideo', eee => {
        eee.returnValue = files.length > 0 ? files[0] : video.mp4Link;
      });
      ipcMain.once('getVideoData', eee => {
        eee.returnValue = video;
      });
      videoWindow.on('close', () => {
        videoWindows = videoWindows.filter(w => w !== videoWindow);
        if(!seederWindow.isDestroyed()) seederWindow.send('setPlaying', video.magnetLink, false);
      });
    });
    seederWindow.send('setPlaying', video.magnetLink, true);
  });

  ipcMain.on('progress', (e, _id, progress, duration) => {
    if(!appWindow.isDestroyed()) appWindow.send('progress', _id, progress, duration);
  });

});

// Properly close the application
app.on('window-all-closed', () => {
  app.quit();
});

// Check for updates and automatically install
if(!isDev) autoUpdater.checkForUpdates();
