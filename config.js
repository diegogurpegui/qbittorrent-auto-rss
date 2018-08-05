require("dotenv").config() // this loads the defined variables from .env

const config = {
  // qBittorrent Web API
  qbt: {
    host: process.env.QBT_HOST || "localhost",
    port: process.env.QBT_PORT || 8080,
    user: process.env.QBT_USER || "admin",
    pass: process.env.QBT_PASS || "adminadmin"
  },
  feeds_file: process.env.FEEDS_FILE || "",
  logger: {
    directory: process.env.LOGS_DIR || "logs",
    console: process.env.LOGS_CONSOLE || false,
  }
}

module.exports = config
