/**
 * @typedef VideoEnclosure
 * @type {Object}
 * @property {string} length
 * @property {string} type
 * @property {string} url
 */

/**
 * Class representing a video.
 */
class Video {

  /**
   * Construct a video object
   * @param {Object} data
   */
  constructor(data) {
    /** @type {string} */
    this._id = data._id || data.guid;
    /** @type {string} */
    this.title = data.title;
    /** @type {string} */
    this.content = data.content;
    /** @type {string} */
    this.contentSnippet = data.contentSnippet;
    /** @type {string} */
    this.isoDate = data.isoDate;
    /** @type {string} */
    this.link = data.link;
    /** @type {string} */
    this.pubDate = data.pubDate;
    /** @type {string} */
    this.channel = data.channel;
    /** @type {boolean} */
    this.played = data.played || false;
    /** @type {number} */
    this.progress = data.progress || 0;
    /** @type {VideoEnclosure} */
    this.enclosure = data.enclosure;
  }

  /**
   * Sets a value on a video
   * @method set
   * @param {string} key
   * @param {any} val
   * @returns {Channel}
   */
  set(key, val) {
    if(!key) throw new Error('You must pass in a key String to the set method!');
    return new Video({
      ...this,
      [key]: val
    });
  }

}

export default Video;
