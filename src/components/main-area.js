import PropTypes from 'prop-types';
import React from 'react';
import Video from './video';

const MainArea = ({ selectedChannel, videos, onPlayVideo, onMarkWatched }) => {

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
      padding: 5,
      position: 'relative'
    },
    itemImage: {
      width: '100%',
      height: 'auto'
    },
    unplayedMarker: {
      position: 'absolute',
      right: 10,
      top: 10,
      width: 15,
      height: 15,
      borderRadius: '50%'
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
      const onWatchClick = e => {
        e.preventDefault();
        e.stopPropagation();
        onMarkWatched(v._id);
      };

      return (
        <div key={v._id} className={'video-item'} style={styles.itemContainer} onClick={onClick}>
          <img src={v.enclosure.url} style={styles.itemImage} />
          <div dangerouslySetInnerHTML={{__html: v.title}}></div>
          {v.played ? '' : <div style={styles.unplayedMarker} className={'unplayed-marker'} title={'Mark watched.'} onClick={onWatchClick}></div>}
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
  onPlayVideo: PropTypes.func,
  onMarkWatched: PropTypes.func
};

export default MainArea;
