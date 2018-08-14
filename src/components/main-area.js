import PropTypes from 'prop-types';
import React from 'react';
import Video from './video';

const MainArea = ({ selectedChannel, videos, onPlayVideo }) => {

  const styles = {
    container: {
      flexGrow: 1,
      height: '100%',
      padding: 5,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      overflowY: 'auto'
    },
    itemContainer: {
      width: 200,
      minWidth: 200,
      margin: 10,
      padding: 5
    },
    itemImage: {
      width: '100%',
      height: 'auto'
    }
  };

  const items = videos
    .filter(v => v.channel === selectedChannel)
    .sort((a, b) => -1 * a.isoDate.localeCompare(b.isoDate))
    .map(v => {

      const onClick = e => {
        e.preventDefault();
        onPlayVideo(v._id);
      };

      return (
        <div key={v._id} className={'video-item'} style={styles.itemContainer} onClick={onClick}>
          <img src={v.enclosure.url} style={styles.itemImage} />
          <div dangerouslySetInnerHTML={{__html: v.title}}></div>
        </div>
      );
    });

  return (
    <div style={styles.container}>
      {items}
    </div>
  );
};
MainArea.propTypes = {
  selectedChannel: PropTypes.string,
  videos: PropTypes.arrayOf(PropTypes.instanceOf(Video)),
  onPlayVideo: PropTypes.func
};

export default MainArea;
