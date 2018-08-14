import uuid from 'uuid';

/**
 * Class representing a channel.
 */
class Channel {

  /**
   * Construct a channel object
   * @param {Object} data
   */
  constructor(data) {
    /** @type {string} */
    this._id = data._id || uuid.v4();
    /** @type {string} */
    this.title = data.title;
    /** @type {string} */
    this.description = data.description;
    /** @type {string} */
    this.link = data.link;
    /** @type {string} */
    this.feedUrl = data.feedUrl;
    /** @type {string} */
    this.language = data.language;
    /** @type {string} */
    this.lastBuildDate = data.lastBuildDate;
  }

  /**
   * Sets a value on a Channel
   * @method set
   * @param {string} key
   * @param {any} val
   * @returns {Channel}
   */
  set(key, val) {
    if(!key) throw new Error('You must pass in a key String to the set method!');
    return new Channel({
      ...this,
      [key]: val
    });
  }

}

export default Channel;
