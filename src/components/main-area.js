import { clipboard, remote } from 'electron';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Video from './video';

const { Menu } = remote;

const MainArea = ({ selectedChannel, videos, onPlayVideo, onMarkWatched, onMarkUnwatched }) => {

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
        onMarkWatched(v._id);
      };
      const onWatchClick = e => {
        e.preventDefault();
        e.stopPropagation();
        onMarkWatched(v._id);
      };
      const onContextMenu = e => {
        e.preventDefault();
        const videoLink = `https://www.bitchute.com/video/${v._id}/`;
        const menu = Menu.buildFromTemplate([
          {
            label: v.played ? 'Mark unwatched' : 'Mark watched',
            click: () => {
              try {
                if(v.played) {
                  onMarkUnwatched(v._id);
                } else {
                  onMarkWatched(v._id);
                }
              } catch(err) {
                handleError(err);
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Copy video URL',
            click: () => {
              try {
                clipboard.writeText(videoLink);
              } catch(err) {
                handleError(err);
              }
            }
          },
          {
            label: 'Copy embed URL',
            click: () => {
              try {
                clipboard.writeText(v.link);
              } catch(err) {
                handleError(err);
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Open in browser',
            click: () => {
              const { openExternal } = remote.shell;
              openExternal(videoLink);
            }
          }
        ]);
        menu.popup({});
      };

      return (
        <div key={v._id} className={'video-item'} style={styles.itemContainer} onClick={onClick} onContextMenu={onContextMenu}>
          <img src={v.enclosure.url} style={styles.itemImage} />
          <div style={{userSelect: 'none'}}>
            <div dangerouslySetInnerHTML={{__html: v.title}}></div>
            <div className={'text-muted'}><small>{moment(v.isoDate).format('MMM D, YYYY')}</small></div>
          </div>
          {v.played ? '' : <div style={styles.unplayedMarker} className={'unplayed-marker'} title={'Mark watched'} onClick={onWatchClick}></div>}
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
  onMarkWatched: PropTypes.func,
  onMarkUnwatched: PropTypes.func
};

export default MainArea;
