const $ = require('jquery');
const { ipcRenderer } = require('electron');

const video = ipcRenderer.sendSync('getVideoData');
const mp4 = ipcRenderer.sendSync('getVideo');

const { _id, progress } = video;

const $video = $('video');
$video.attr('src', mp4);
$video[0].currentTime = (video.duration && video.duration - progress < 30) ? 0 : progress;
$video.on('timeupdate', e => {
  const { currentTime = 0, duration } = e.target;
  if(duration) ipcRenderer.send('progress', _id, currentTime, duration);
});
$video[0].play();

const togglePlayback = () => {
  const { paused } = $video[0];
  if(paused) {
    $video[0].play();
  } else {
    $video[0].pause();
  }
};

$('body').on('keypress', e => {
  const { code } = e.originalEvent;
  if(code !== 'Space') return;
  togglePlayback();
});
$video.on('click', e => {
  e.preventDefault();
  togglePlayback();
});
