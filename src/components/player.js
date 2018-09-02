const $ = require('jquery');
const { ipcRenderer } = require('electron');

const mp4 = ipcRenderer.sendSync('getVideo');
$('video').attr('src', mp4);
