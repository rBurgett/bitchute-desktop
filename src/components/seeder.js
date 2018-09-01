const path = require('path');
const rmrf = require('rmrf-promise');
const WebTorrent = require('webtorrent');
const storage  = require('./storage');
const { ipcRenderer } = require('electron');

localStorage.setItem('magnets', '[]');

const handleError = err => {
  ipcRenderer.send('handleError', err);
};

const client = new WebTorrent({
  // maxConns: 15
});
client.on('error', handleError);

class Seeder {

  constructor(options) {
    if(options.path) {
      this._torrentOptions = {
        path: options.path
      };
    } else {
      this._torrentOptions = {};
    }
    const magnets = storage.getItem('magnets') || [];
    if(magnets.length === 0) storage.setItem('magnets', []);
    this._torrents = new Map();
    this._initialized = false;
  }

  async initialize() {
    const magnets = storage.getItem('magnets');
    await Promise.all(magnets.map(magnet => new Promise(resolve => {
      let done = false;
      client.add(magnet, this._torrentOptions, torrent => {
        torrent.on('error', handleError);
        this._torrents.set(magnet, torrent);
        done = true;
        resolve();
      });
      // in case there is a problem adding the torrent
      setTimeout(() => {
        if(!done) resolve();
      }, 10000);
    })));
    this._initialized = true;
  }

  async setMagnets(magnets = []) {
    try {
      if (!this._initialized) throw new Error('You cannot call setMagnets until the seeder has been initialized');
      const oldMagnets = [...this._torrents.keys()];
      const toRemove = oldMagnets.filter(m => !magnets.includes(m));
      for(const magnet of toRemove) {
        const torrent = this._torrents.get(magnet);
        if(!torrent) continue;
        const { files } = torrent;
        await new Promise((resolve => {
          torrent.destroy(resolve);
        }));
        await Promise.all(files.map(f => {
          const torrentPath = path.join(this._torrentOptions.path, f.path);
          return rmrf(torrentPath);
        }));
        this._torrents.delete(magnet);
      }
      storage.setItem('magnets', magnets);
      await Promise.all(magnets
        .filter(m => !this._torrents.has(m))
        .map(magnet => new Promise(resolve => {
          let done = false;
          client.add(magnet, this._torrentOptions, torrent => {
            torrent.on('error', handleError);
            this._torrents.set(magnet, torrent);
            done = true;
            resolve();
          });
          setTimeout(() => {
            if(!done) resolve();
          }, 10000);
        }))
      );
    } catch(err) {
      handleError(err);
    }
  }

}

const seeder = new Seeder({
  path: ipcRenderer.sendSync('getTorrentPath')
});
seeder.initialize()
  .then(() => {
    ipcRenderer.send('seederInitialized');
  })
  .catch(err => ipcRenderer.send('handleError', err));
ipcRenderer.on('setMagnets', (e, magnets) => {
  seeder.setMagnets(magnets);
});
