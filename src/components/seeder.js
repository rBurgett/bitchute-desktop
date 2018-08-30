import path from 'path';
import rmrf from 'rmrf-promise';
import WebTorrent from 'webtorrent';
import storage from './storage';

const client = new WebTorrent();

export default class Seeder {

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
    if (!this._initialized) throw new Error('You cannot call setMagnets until the seeder has been initialized');
    const oldMagnets = [...this._torrents.keys()];
    const toRemove = oldMagnets.filter(m => !magnets.includes(m));
    for(const magnet of toRemove) {
      const torrent = this._torrents.get(magnet);
      if(!torrent) continue;
      await new Promise((resolve => torrent.destroy(resolve)));
      await Promise.all(torrent.files.map(f => rmrf(path.join(this._torrentOptions.pathf.path, f.path))));
      this._torrents.delete(magnet);
    }
    storage.setItem('magnets', magnets);
    await Promise.all(magnets
      .filter(m => !this._torrents.has(m))
      .map(magnet => new Promise(resolve => {
        let done = false;
        client.add(magnet, this._torrentOptions, torrent => {
          this._torrents.set(magnet, torrent);
          done = true;
          resolve();
        });
        setTimeout(() => {
          if(!done) resolve();
        }, 10000);
      }))
    );
  }

}
