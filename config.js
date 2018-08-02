require("dotenv").config() // this loads the defined variables from .env

const config = {
  // qBittorrent Web API
  qbt: {
    url: process.env.QBT_URL || "http://localhost:8080",
    user: process.env.QBT_USER || "admin",
    pass: process.env.QBT_PASS || "adminadmin"
  },
  feeds_file: process.env.FEEDS_FILE || ""
}

module.exports = config
