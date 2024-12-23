const program = require("commander");
const fs = require("fs");
const config = require("./config");
const logger = require("./logger");
const QbtAPI = require("./qbtAPI");
const FeedsProcessor = require("./feedsProcessor");

program
  .version("0.1.0", "-v, --version")
  .description(
    "Command line tool to automate torrent download for qBittorrent from an RSS source, to a customizable save paths"
  );

program
  .command("qbtversion")
  .description("Gets the qBittorrent version.")
  .action(() => {
    logger.info("Getting qBt version");
    this.qbtAPI = new QbtAPI();

    this.qbtAPI
      .getVersion()
      .then((res) => {
        console.log(`Version: ${res.appVersion}`);
        console.log(`API version: ${res.apiVersion}`);
      })
      .catch((err) => {
        logger.error("Error getting version.", err);
      });
  });

program
  .command("fetch")
  .option("-f, --feeds <feedsFilePath>")
  .description("Fetch the torrents from the feeds defined in the 'feeds' file.")
  .action((cmd) => {
    logger.info("Fetch started");

    let feedsFilePath = cmd.feeds || config.feeds_file;

    // check that the file path is not empty
    if (typeof feedsFilePath === "undefined" || feedsFilePath == "") {
      logger.error("Feeds file not specified.");
      return;
    }
    try {
      // check the file existence
      fs.statSync(feedsFilePath);

      // process the file
      let feedsProcessor = new FeedsProcessor();
      feedsProcessor.fetch(feedsFilePath);
    } catch (err) {
      if (err.code === "ENOENT") {
        logger.error(`The Feeds file ("${feedsFilePath}") does not exist.`);
      } else {
        logger.error("Error: " + err);
      }
    }
  });

program.parse(process.argv);
