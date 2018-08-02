const program = require("commander")
const fs = require("fs")
const config = require("./config")

program
  .version("0.1.0", "-v, --version")
  .description(
    "Command line tool to automate torrent download for qBittorrent from an RSS source, to a customizable save paths"
  )

program
  .command("fetch")
  .option("-f, --feeds <feedsFilePath>")
  .description("Fetch the torrents from the feeds defined in the 'feeds' file.")
  .action(cmd => {
    let feedsFilePath = cmd.feeds || config.feeds_file

    // check that the file path is not empty
    if (typeof feedsFilePath === "undefined" || feedsFilePath == "") {
      console.error("Feeds file not specified.")
      return
    }
    try {
      // check the file existence
      fs.statSync(feedsFilePath)

      let feedsObj = require(feedsFilePath)

      // iterate the different feeds
      for (let i = 0; i < feedsObj.feeds.length; i++) {
        let feed = feedsObj.feeds[i]
        console.log(feed.url)
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        console.error(`The Feeds file ("${feedsFilePath}") does not exist.`)
      } else {
        console.error("Error: " + err)
      }
    }
  })

program.parse(process.argv)
