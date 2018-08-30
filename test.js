const WebTorrent = require('webtorrent');

const handleError = console.error;

(async function() {
  try {
    const client = new WebTorrent();
    const magnetURI = 'magnet:?xt=urn:btih:f4c9f80111d89a541da66d8bdb2340c177169e8c&dn=GQh2UzYuARxu.mp4&tr=udp://explodie.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.empire-js.us:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.opentrackr.org:1337&tr=wss://tracker.openwebtorrent.com&as=https://seed23.bitchute.com/9c7qJvwx7YQT/GQh2UzYuARxu.mp4&xs=https://www.bitchute.com/torrent/9c7qJvwx7YQT/GQh2UzYuARxu.webtorrent';
    client.add(magnetURI, {path: '/Users/ryan/.bitchute-desktop-temp'}, torrent => {
      console.log('Client is downloading:', torrent.infoHash);
      torrent.files.forEach(function (file) {
        // console.log(file);
      });

      torrent.on('error', err => {
        handleError(err);
      });
      torrent.on('upload', () => {
        console.log('upload');
      });
      torrent.on('download', () => {
        console.log(torrent.progress);
      });
      torrent.on('done', () => {
        console.log('Done!');
        console.log(torrent.files.map(f => f.path));
        // setTimeout(() => {
        //   client.remove(magnetURI, err => {
        //     if(err) handleError(err);
        //     else console.log('Removed!');
        //   });
        // }, 5000);
      });

    });
    // const patt = /<video.+src="(.+?)"/;
    // console.log(text);
    // console.log(text.match(patt)[1]);
  } catch(err) {
    handleError(err);
  }
})();
