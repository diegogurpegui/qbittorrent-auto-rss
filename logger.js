const fs = require("fs")
const config = require("./config")

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
  level = level.toUpperCase()
  if (config.logger.console) {
    let consoleData = data || ""
    if (level === "ERROR") {
      console.error(msg, consoleData)
    } else {
      console.log(msg, consoleData)
    }
  }

  let dateStr = new Date().toISOString()
  if (typeof data === "undefined") {
    data = ""
  } else if (data instanceof Object) {
    data = " => " + JSON.stringify(data)
  }
  let message = `[${dateStr}] - ${level} - ${msg}` + "\r\n"
  logFileStream.write(message)
}

let logger = {
  // Level functions
  info: function(msg, data) {
    logMessage("info", msg, data)
  },

  debug: function(msg, data) {
    logMessage("debug", msg, data)
  },

  warning: function(msg, data) {
    logMessage("warning", msg, data)
  },

  error: function(msg, data) {
    logMessage("debug", msg, data)
  }
}

module.exports = logger
