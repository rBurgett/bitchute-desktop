import { remote } from 'electron';
import bindAll from 'lodash/bindAll';
import PropTypes from 'prop-types';
import React from 'react';
import Parser from 'rss-parser';
import request from 'superagent';
import swal from 'sweetalert2';
import Sidebar from './sidebar';
import Channel from './channel';
import Video from './video';
import MainArea from './main-area';

const { BrowserWindow } = remote;

const parser = new Parser();

const getLinks = async function(_id) {
  const { text } = await request.get(`https://www.bitchute.com/video/${_id}/`);
  let magnetLink = '', mp4Link = '';
  const magnetPatt = /"(magnet:.+?)"/;
  if(magnetPatt.test(text)) magnetLink = text.match(magnetPatt)[1];
  const mp4Patt = /<video(?:.|\n)+?src="(.+?\.mp4)"/;
  if(mp4Patt.test(text)) mp4Link = text.match(mp4Patt)[1];
  return { magnetLink, mp4Link };
};

const getFeedFromURL = async function(feedURL) {
  const { text } = await request.get(feedURL)
    .buffer()
    .type('xml');
  const feed = await parser.parseString(text);
  return feed;
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedChannel: '',
      channels: [],
      videos: [],
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    };
    bindAll(this, [
      'onAddChannelClick',
      'onChannelClick',
      'onDeleteChannel',
      'onPlayVideo',
      'onMarkWatched',
      'onMarkAllWatched',
      'onMarkUnwatched'
    ]);
  }

  async componentDidMount() {
    try {

      window.addEventListener('resize', e => {
        const { innerHeight, innerWidth } = e.target;
        this.setState({
          ...this.state,
          windowHeight: innerHeight,
          windowWidth: innerWidth
        });
      });

      const channelsFromDB = await db.channels.find({});
      const channels = channelsFromDB.map(c => new Channel(c));
      const videosFromDB = await db.videos.find({});
      const videos = videosFromDB.map(v => new Video(v));
      for(let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if(!video.magnetLink || !video.mp4Link) {
          const {magnetLink, mp4Link} = await getLinks(video._id);
          await db.videos.update({_id: video._id}, {$set: {magnetLink, mp4Link}});
          const newVideo = video
            .set('magnetLink', magnetLink)
            .set('mp4Link', mp4Link);
          videos[i] = newVideo;
        }
      }
      this.setState({
        ...this.state,
        channels,
        videos
      });

      await this.updateChannels(channels);

      setInterval(() => {
        this.updateChannels(this.state.channels);
      }, 30000);

    } catch(err) {
      handleError(err);
    }
  }

  async updateChannels(channels) {
    try {
      if(channels.length > 0) {
        const newVideos = [];
        for (let i = 0; i < channels.length; i++) {
          const channel = channels[i];
          const {items} = await
          getFeedFromURL(channel.feedUrl);
          for (const item of items) {
            const found = await db.videos.findOne({_id: item.guid});
            if (!found) {
              const video = new Video({
                ...item,
                channel: channel._id
              });
              newVideos.push(video);
              db.videos.insert(video);
            }
          }
        }
        this.setState({
          ...this.state,
          videos: [
            ...this.state.videos,
            ...newVideos
          ]
        });
      }
    } catch(err) {
      handleError(err);
    }
  }

  async onAddChannelClick() {
    try {
      const { value: origValue = '' } = await swal({
        title: 'Channel Name',
        input: 'text',
        showCancelButton: true
      });
      const value = origValue ? origValue.trim().toLowerCase() : origValue;
      if(!value) return;
      const feedURL = `https://www.bitchute.com/feeds/rss/channel/${value}`;
      const feed = await getFeedFromURL(feedURL);
      const channel = new Channel(feed);
      const channelFromDB = await db.channels.findOne({ feedUrl: channel.feedUrl });
      if(channelFromDB) {
        swal({
          type: 'error',
          text: 'That feed has already been added.'
        });
        return;
      }
      await db.channels.insert({
        ...channel
      });
      const videos = feed.items
        .map(i => ({
          ...i,
          channel: channel._id,
          played: false,
          progress: 0
        }))
        .map(i => new Video(i));
      for(let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const {magnetLink, mp4Link} = await getLinks(video._id);
        const newVideo = video
          .set('magnetLink', magnetLink)
          .set('mp4Link', mp4Link);
        videos[i] = newVideo;
        await db.videos.insert(newVideo);
      }
      this.setState({
        ...this.state,
        channels: [
          ...this.state.channels,
          channel
        ],
        videos: [
          ...this.state.videos,
          ...videos
        ]
      });
    } catch(err) {
      handleError(err);
    }
  }

  onChannelClick(_id) {
    this.setState({
      ...this.state,
      selectedChannel: _id
    });
  }

  async onDeleteChannel(_id) {
    try {
      const { channels, videos } = this.state;
      await db.channels.remove({ _id });
      const videosToRemove = videos.filter(v => v.channel === _id).map(v => v._id);
      const videosToRemoveSet = new Set(videosToRemove);
      for(const vId of videosToRemove) {
        await db.videos.remove({_id: vId});
      }
      const newVideos = videos.filter(v => !videosToRemoveSet.has(v._id));
      const newChannels = channels.filter(c => c._id !== _id);
      this.setState({
        ...this.state,
        selectedChannel: this.state.selectedChannel === _id ? '' : this.state.selectedChannel,
        channels: newChannels,
        videos: newVideos
      });
    } catch(err) {
      handleError(err);
    }
  }

  onPlayVideo(_id) {
    console.log(_id);
    const video = this.state.videos.find(v => v._id === _id);
    let win = new BrowserWindow({
      backgroundColor: '#000'
    });
    win.on('closed', () => {
      win = null;
    });
    win.loadURL(video.link);
  }

  async onMarkWatched(_id) {
    try{
      const { videos } = this.state;
      const idx = videos.findIndex(v => v._id === _id);
      const video = videos[idx];
      this.setState({
        ...this.state,
        videos: [
          ...videos.slice(0, idx),
          video.set('played', true),
          ...videos.slice(idx + 1)
        ]
      });
      await db.videos.update({ _id }, {$set: {played: true}});
    } catch(err) {
      handleError(err);
    }
  }

  async onMarkUnwatched(_id) {
    try{
      const { videos } = this.state;
      const idx = videos.findIndex(v => v._id === _id);
      const video = videos[idx];
      this.setState({
        ...this.state,
        videos: [
          ...videos.slice(0, idx),
          video.set('played', false),
          ...videos.slice(idx + 1)
        ]
      });
      await db.videos.update({ _id }, {$set: {played: false}});
    } catch(err) {
      handleError(err);
    }
  }

  async onMarkAllWatched(_id) {
    try {
      const { videos } = this.state;
      const filteredVideos = videos
        .filter(v => v.channel === _id)
        .filter(v => !v.played);
      let newVideos = videos;
      for(const video of filteredVideos) {
        const idx = videos.findIndex(v => v._id === video._id);
        newVideos = [
          ...newVideos.slice(0, idx),
          video.set('played', true),
          ...newVideos.slice(idx + 1)
        ];
        await db.videos.update({ _id: video._id }, {$set: {played: true}});
      }
      this.setState({
        ...this.state,
        videos: newVideos
      });
    } catch(err) {
      handleError(err);
    }
  }

  render() {

    console.log('state', this.state);

    const { selectedChannel, channels, videos, windowHeight } = this.state;
    const { version } = this.props;

    const styles = {
      container: {
        paddingTop: 50
      },
      flexContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        height: windowHeight - 50
      }
    };

    return (
      <div style={styles.container}>
        <nav className={'navbar navbar-expand-sm fixed-top navbar-dark bg-dark app-navbar'}>
          <span style={{cursor: 'default'}} className="navbar-brand">BitChute Desktop <span className={'text-muted'}>{version}</span></span>
        </nav>
        <div style={styles.flexContainer}>
          {<Sidebar selectedChannel={selectedChannel} channels={channels} videos={videos} onAddChannelClick={this.onAddChannelClick} onChannelClick={this.onChannelClick} onDeleteChannel={this.onDeleteChannel} onMarkAllWatched={this.onMarkAllWatched} />}
          {<MainArea selectedChannel={selectedChannel} videos={videos} onPlayVideo={this.onPlayVideo} onMarkWatched={this.onMarkWatched} onMarkUnwatched={this.onMarkUnwatched} />}
        </div>
      </div>
    );
  }

}
App.propTypes = {
  version: PropTypes.string
};

export default App;
