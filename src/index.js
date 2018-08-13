import { ipcRenderer } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import Datastore from 'nedb';
import path from 'path';
import swal from 'sweetalert2';
import App from './components/app';

const handleError = err => {
  console.error(err);
  swal({
    type: 'error',
    title: 'Oops!',
    text: err.message
  });
};
window.handleError = handleError;

const dataPath = ipcRenderer.sendSync('getDataPath');
const db = {
  channels: new Datastore({ filename: path.join(dataPath, 'channels.db'), autoload: true }),
  videos: new Datastore({ filename: path.join(dataPath, 'videos.db'), autoload: true })
};
window.db = db;

const version = ipcRenderer.sendSync('getVersion');
document.title = document.title + ' ' + version;

ReactDOM.render(<App version={version} />, document.getElementById('js-main'));
