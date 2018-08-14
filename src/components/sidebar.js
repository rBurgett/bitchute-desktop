import { remote } from 'electron';
import PropTypes from 'prop-types';
import React from 'react';
import swal from 'sweetalert2';
import Channel from './channel';
import Video from './video';

const { Menu } = remote;

const Sidebar = ({ selectedChannel, channels, videos, onAddChannelClick, onChannelClick, onDeleteChannel, onMarkAllWatched }) => {

  const borderColor = '#434857';

  const styles = {
    col1: {
      minWidth: 300,
      height: '100%',
      borderRightColor: borderColor,
      borderRightStyle: 'solid',
      borderRightWidth: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    },
    col1Header: {
      minHeight: 68,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 10,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between'
    },
    col1ListContainer: {
      flexGrow: 1,
      overflowY: 'scroll',
      paddingTop: 15,
      paddingLeft: 15,
      paddingRight: 15,
      paddingBottom: 15
    }
  };

  const items = channels.map(c => {

    const unplayedLength = videos
      .filter(v => v.channel === c._id)
      .filter(v => !v.played)
      .length;

    const onClick = e => {
      e.preventDefault();
      onChannelClick(c._id);
    };

    const onContextMenu = e => {
      e.preventDefault();
      console.log(e);
      console.log(e.clientX, e.clientY);
      const menu = Menu.buildFromTemplate([
        {
          label: 'Mark all watched',
          click: async function() {
            try {
              onMarkAllWatched(c._id);
            } catch(err) {
              handleError(err);
            }
          }
        },
        {
          label: 'Delete Channel',
          click: async function() {
            try {
              const { value: confirmed } = await swal({
                type: 'warning',
                text: `Are you sure that you want to delete ${c.title}? If you continue, this channel and all associated videos will be removed.`,
                showCancelButton: true
              });
              if(confirmed) onDeleteChannel(c._id);
            } catch(err) {
              handleError(err);
            }
          }
        }
      ]);
      menu.popup({});
    };

    return (
      <li key={c._id} className={'nav-item'}>
        <a href={'#'} className={'nav-link' + (c._id === selectedChannel ? ' active' : '')} onClick={onClick} onContextMenu={onContextMenu}>{c.title} {unplayedLength > 0 ? <small className={'badge badge-unwatched'}>{unplayedLength}</small> : ''}</a>
      </li>
    );
  });

  const addChannelClicked = e => {
    e.preventDefault();
    onAddChannelClick();
  };

  return (
    <div style={styles.col1}>
      <div style={styles.col1Header}>
        <h2 style={{flexGrow: 1}}>Channels</h2>
        <div>
          <button type={'button'} className={'btn btn-outline-primary'} onClick={addChannelClicked}><i className={'fa fa-plus'} /></button>
        </div>
      </div>
      <div style={styles.col1ListContainer}>
        <ul className={'nav nav-pills nav-stacked flex-column'}>
          {items}
        </ul>
      </div>
    </div>
  );
};
Sidebar.propTypes = {
  selectedChannel: PropTypes.string,
  channels: PropTypes.arrayOf(PropTypes.instanceOf(Channel)),
  videos: PropTypes.arrayOf(PropTypes.instanceOf(Video)),
  onAddChannelClick: PropTypes.func,
  onChannelClick: PropTypes.func,
  onDeleteChannel: PropTypes.func,
  onMarkAllWatched: PropTypes.func
};

export default Sidebar;
