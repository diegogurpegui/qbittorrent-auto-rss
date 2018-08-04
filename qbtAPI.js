const request = require("request")
const config = require("./config")

class QbtAPI {
  constructor() {
    this.apiUser = config.qbt.user
    this.apiPass = config.qbt.pass
    this.apiHost = config.qbt.host
    this.apiPort = config.qbt.port
  }

  /**
   * Call to an API command
   * @param {string} method HTTP method, like GET or POST
   * @param {string} path URL path to the command
   * @param {object} data
   * @returns {Promise}
   */
  call(method, path, data, headers) {
    let baseUrl = "http://" + this.apiHost + ":" + this.apiPort
    let url = baseUrl + path
    // prepare options
    let options = {
      method: method,
      url: url,
      headers: {
        Referer: baseUrl,
        "Cookie": this.cookie || ""
      }
    }
    if (method === "POST") {
      options.headers["Content-Type"] = "multipart/form-data"
      options.formData = data
    }
    // use parameters headers, if defined
    if (typeof headers !== "undefined") {
      options.headers = Object.assign(options.headers, headers)
    }
    // create the return promise
    return new Promise((resolve, reject) => {
      // call the API
      console.log("Calling: " + options.url)
      request(options, (err, res, body) => {
        if (err) {
          console.error("API call failed:", err)
          reject(err)
          return
        }
        resolve(body)
      })
    })
  }

  async authenticate() {
    let self = this
    let baseUrl = "http://" + this.apiHost + ":" + this.apiPort
    let url = baseUrl + "/login"
    // prepare options
    let options = {
      method: "POST",
      url: url,
      headers: {
        Referer: baseUrl,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      //formData: "username=" + this.apiUser + "&password=" + this.apiPass
      form: {
        username: this.apiUser,
        password: this.apiPass
      }
    }
    return new Promise(async (resolve, reject) => {
      // call the API
      console.log("Calling: " + options.url)
      request(options, (err, res, body) => {
        if (err) {
          console.error("API call failed:", err)
          reject(err)
          return
        }
        // check the headers to see if the Cookie is in them
        if (
          !res.headers.hasOwnProperty("Set-Cookie") &&
          !res.headers.hasOwnProperty("set-cookie")
        ) {
          console.error("Login error.", body)
          reject(body)
        } else {
          let cookie = res.headers["Set-Cookie"] || res.headers["set-cookie"]
          // get the raw string
          if (Array.isArray(cookie)) {
            cookie = cookie[0]
          }
          // now remove the unnecessary part
          self.cookie = cookie.substring(0, cookie.indexOf(";"))
          console.log("Auth response.", self.cookie)
          resolve({ cookie: self.cookie })
        }
      })
    })
  }

  /**
   * This method can add torrents from URLs. http://, https://, magnet: and bc://bt/ links are supported.
   * @param {string} urls
   * @param {object} params
   */
  async download(urls, params) {
    // make sure I have an array of URLs
    if (typeof urls === "string" || urls instanceof String) {
      urls = [urls]
    }

    let apiData = {
      urls: urls.join("\n"),
      savepath: params.savepath
    }
    await this.call("POST", "/command/download", apiData)
  }
}

module.exports = QbtAPI
