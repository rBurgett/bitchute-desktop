import bindAll from 'lodash/bindAll';
import PropTypes from 'prop-types';
import React from 'react';
import Parser from 'rss-parser';
import request from 'superagent';
import swal from 'sweetalert2';
import Sidebar from './sidebar';
import Channel from './channel';
import Video from './video';

const parser = new Parser();

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
      'onDeleteChannel'
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

      const channels = await db.channels.find({});
      const videos = await db.videos.find({});
      this.setState({
        ...this.state,
        channels: channels.map(c => new Channel(c)),
        videos: videos.map(v => new Video(v))
      });

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
      const { text } = await request.get(feedURL)
        .buffer()
        .type('xml');
      const feed = await parser.parseString(text);
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
      for(const video of videos) {
        await db.videos.insert(video);
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

  render() {

    console.log('state', this.state);

    const { selectedChannel, channels, videos, windowHeight } = this.state;
    const { version } = this.props;

    const styles = {
      flexContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        height: windowHeight - 50
      },
      col2: {
        flexGrow: 1,
        height: '100%',
        padding: 15
      }
    };

    return (
      <div className={'with-top-navbar'}>
        <nav className={'navbar navbar-expand-sm fixed-top navbar-dark bg-dark app-navbar'}>
          <a className="navbar-brand" href={'#'}>BitChute Desktop <span className={'text-muted'}>{version}</span></a>
        </nav>
        <div style={styles.flexContainer}>
          {<Sidebar selectedChannel={selectedChannel} channels={channels} videos={videos} onAddChannelClick={this.onAddChannelClick} onChannelClick={this.onChannelClick} onDeleteChannel={this.onDeleteChannel} />}
          <div style={styles.col2}></div>
        </div>
      </div>
    );
  }

}
App.propTypes = {
  version: PropTypes.string
};

export default App;
