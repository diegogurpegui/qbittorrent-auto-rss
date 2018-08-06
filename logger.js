const fs = require("fs")
const config = require("./config")

// level numbers
const levels = {
  all: 0,
  debug: 10,
  info: 20,
  warning: 30,
  error: 40
}
// get the current level
const currentLevel = config.logger.level.toLowerCase()

// create the logs directory
try {
  fs.mkdirSync(config.logger.directory)
} catch (err) {
  // probably because the log directory already existed
}
// Create the stream for the log file
let logFileStream = fs.createWriteStream(config.logger.directory + "/app.log", {
  flags: "a"
})

function logMessage(level, msg, data) {
  level = level.toLowerCase()
  // only log if it is withing the current level
  if (levels[level] >= levels[currentLevel]) {
    if (config.logger.console) {
      let consoleData = data || ""
      if (level === "error") {
        console.error(msg, consoleData)
      } else {
        console.log(msg, consoleData)
      }
    }

    let dateStr = new Date().toISOString()
    if (typeof data === "undefined") {
      data = ""
    } else {
      // try to parse the object to string
      try {
        data = " => " + JSON.stringify(data)
      } catch (err) {
        // couldn't parse, then concat as it is
        data = " => " + data
      }
    }
    let message = `[${dateStr}] - ${level} - ${msg} ${data}` + "\r\n"
    logFileStream.write(message)
  }
}

let logger = {
  debug: function(msg, data) {
    logMessage("debug", msg, data)
  },
  info: function(msg, data) {
    logMessage("info", msg, data)
  },
  warning: function(msg, data) {
    logMessage("warning", msg, data)
  },
  error: function(msg, data) {
    logMessage("error", msg, data)
  }
}

module.exports = logger
