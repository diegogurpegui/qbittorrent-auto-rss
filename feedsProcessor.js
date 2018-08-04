const RssParser = require("rss-parser")
const QbtAPI = require("./qbtAPI")

class FeedsProcessor {
  constructor() {
    this.rssParser = new RssParser()
    this.qbtAPI = new QbtAPI()
  }

  async fetch(feedsSource) {
    try {
      await this.qbtAPI.authenticate()

      let feedsObj = require(feedsSource)

      // iterate the different feeds
      for (let i = 0; i < feedsObj.feeds.length; i++) {
        let feedObject = feedsObj.feeds[i]
        this.fetchSingle(feedObject)
      }
    } catch (err) {
      console.error("Error fetching.")
    }
  }

  async fetchSingle(feedObject) {
    console.log(feedObject.url)
    console.log("---------->>")

    let torrentUrls = []

    let feed = await this.rssParser.parseURL(feedObject.url)
    for (let i = 0; i < feed.items.length; i++) {
      let item = feed.items[i]
      // first check if he item has to be processed
      if (this.matchFilters(item, feedObject.filters || [])) {
        //console.log("Title: " + item.title)
        torrentUrls.push(item.link)
      }
    }
    // call Qbt to download
    let params = {
      savepath: feedObject.savepath
    }
    await this.qbtAPI.download(torrentUrls, params)

    console.log("<<---------")
  }

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
