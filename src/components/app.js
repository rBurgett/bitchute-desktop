import bindAll from 'lodash/bindAll';
import PropTypes from 'prop-types';
import React from 'react';
import Parser from 'rss-parser';
import request from 'superagent';
import swal from 'sweetalert2';

const parser = new Parser();

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth
    };
    bindAll(this, [
      'onAddChannelClick'
    ]);
  }

  UNSAFE_componentWillMount() {
    window.addEventListener('resize', e => {
      const { innerHeight, innerWidth } = e.target;
      this.setState({
        ...this.state,
        windowHeight: innerHeight,
        windowWidth: innerWidth
      });
    });
  }

  async onAddChannelClick(e) {
    try {
      e.preventDefault();
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
      console.log(feed);
    } catch(err) {
      handleError(err);
    }
  }

  render() {

    const { windowHeight } = this.state;
    const { version } = this.props;

    const styles = {
      flexContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        height: windowHeight - 50
      },
      col1: {
        width: 300,
        height: '100%',
        padding: 15,
        borderRightColor: '#434857',
        borderRightStyle: 'solid',
        borderRightWidth: 1
      },
      col2: {
        flexGrow: 1,
        height: '100%',
        padding: 15
      },
      col1Header: {
        paddingBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between'
      }
    };

    return (
      <div className={'with-top-navbar'}>
        <nav className={'navbar navbar-expand-sm fixed-top navbar-dark bg-dark app-navbar'}>
          <a className="navbar-brand" href={'#'}>BitChute Desktop <span className={'text-muted'}>{version}</span></a>
        </nav>
        <div style={styles.flexContainer}>
          <div style={styles.col1}>
            <div style={styles.col1Header}>
              <h2 style={{flexGrow: 1}}>Channels</h2>
              <div>
                <button type={'button'} className={'btn btn-outline-primary'} onClick={this.onAddChannelClick}><i className={'fa fa-plus'} /></button>
              </div>
            </div>
          </div>
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
