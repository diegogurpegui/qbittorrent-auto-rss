const fs = require("fs")
const crypto = require("crypto")
const RssParser = require("rss-parser")
const QbtAPI = require("./qbtAPI")
const logger = require("./logger")

const feedsLockFile = "feeds-lock.json"

class FeedsProcessor {
  constructor() {
    this.rssParser = new RssParser()
    this.qbtAPI = new QbtAPI()

    try {
      // check the file existence
      fs.statSync(feedsLockFile)
    } catch (err) {
      if (err.code === "ENOENT") {
        // if the file does not exist, create it
        fs.writeFileSync(feedsLockFile, "")
      } else {
        logger.error("Loading feeds lock file.", err)
      }
    }
  }

  async fetch(feedsSource) {
    try {
      await this.qbtAPI.authenticate()

      //let feedsObj = require(feedsSource)
      let feedsRaw = fs.readFileSync(feedsSource)
      let feedsObj = { feeds: [] }
      if (feedsRaw.length > 0) {
        feedsObj = JSON.parse(feedsRaw)
      }

      // iterate the different feeds
      for (let i = 0; i < feedsObj.feeds.length; i++) {
        // try catch to avoid blocking other feeds
        try {
          let feedObject = feedsObj.feeds[i]
          await this.fetchSingle(feedObject)
        } catch (err) {
          logger.error("Failed fetching. ", err)
        }
      }
    } catch (err) {
      logger.error("Error fetching.", err)
    }
  }

  async fetchSingle(feedObject) {
    // open the feeds lock to check downloaded torrents
    let feedsLockRaw = fs.readFileSync(feedsLockFile)
    let feedsLock = {}
    if (feedsLockRaw.length > 0) {
      feedsLock = JSON.parse(feedsLockRaw)
    }

    logger.info("Processing feed: " + feedObject.url)

    let feedHash = crypto
      .createHash("sha256")
      .update(feedObject.url)
      .digest("hex")
    logger.debug("Feed hash: " + feedHash)

    let downloadedGuids = []
    // check if hash already exists
    if (feedsLock.hasOwnProperty(feedHash)) {
      downloadedGuids = feedsLock[feedHash].downloaded_guids
    } else {
      // initialize the torrents feed in the lock file
      feedsLock[feedHash] = {
        downloaded_guids: []
      }
    }

    let torrentUrls = []

    // try to fetch the RSS XML from the URL
    let feed = {}
    try {
      feed = await this.rssParser.parseURL(feedObject.url)
      logger.debug("Feed loaded from URL.")
    } catch (err) {
      err = {
        message: "Parsing URL.",
        innerErr: err
      }
      throw err
    }
    // now iterate through the feed items (torrents) to process each
    logger.debug("Feed items: " + feed.items.length)
    for (let i = 0; i < feed.items.length; i++) {
      let item = feed.items[i]
      // check wether the item was already downloaded
      if (downloadedGuids.includes(item.guid)) {
        continue
      }
      // check if he item has to be processed
      if (!this.matchFilters(item, feedObject.filters || [])) {
        continue
      }
      // if all validation passed, add the URL to the download list
      torrentUrls.push(item.link)
      // and add the GUID to the "downloaded" ones
      downloadedGuids.push(item.guid)
    }
    logger.debug("Feed valid items: " + torrentUrls.length)
    // only cal the API if there are torrents to download
    if (torrentUrls.length > 0) {
      // call Qbt to download
      let params = {
        savepath: feedObject.savepath,
        category: feedObject.category || ""
      }
      try {
        await this.qbtAPI.download(torrentUrls, params)
        logger.debug("Torrents queued for download.")
        // if everything went OK, update the lock file
        feedsLock[feedHash].downloaded_guids = downloadedGuids
        fs.writeFileSync(feedsLockFile, JSON.stringify(feedsLock, null, " "))
      } catch (err) {
        logger.error("Download.", err)
      }
    }
  }

  /**
   * Indicates whether the RSS item match the filters
   * @param {object} item
   * @param {object} filters
   * @returns {boolean}
   */
  matchFilters(item, filters) {
    for (let f = 0; f < filters.length; f++) {
      let filter = filters[f]
      // check if field for filtering exists
      if (item.hasOwnProperty(filter.field)) {
        // check if the item match the filter this field
        let regex = new RegExp(filter.regex, "i")
        if (!regex.test(item[filter.field])) {
          return false
        }
      }
    }
    // all filters passed
    return true
  }
}

module.exports = FeedsProcessor
