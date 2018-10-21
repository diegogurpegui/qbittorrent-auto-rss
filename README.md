# qBittorrent Auto RSS
This is a command line script for autoloading torrents from RSS source and specifying save paths.
This is particularly useful for sources of torrent files that use to have periodic releases.

It is a very simple NodeJS tool that fetches the torrent file information and send it to [qBittorrent](https://github.com/qbittorrent/qBittorrent), so you must have it installed first.

## Table of Contents
  * [Install](#install)
    * [Configuration](#configuration)
  * [How to use](#how-to-use)
    * [The "feeds" file](#the-feeds-file)
    * [Running](#running)
      * [Crontab](#crontab)
  * [Commands reference](#commands-reference)

## Install
First of all, install the project and it's dependencies:
```
git clone https://github.com/diegogurpegui/qbittorrent-auto-rss.git
```
```
npm install
```

### Configuration
You need to specify the connection parameters to connect to qBittorrent. 
Also, you can configure the logging capabilities of the app.
Finally, you have the option to specify a default path of where you are going to put the [`feeds.json` file](#the-feeds-file). This is done by setting the environment variable `FEEDS_FILE`. If you don't do this you'll need to pass the file path from command line.

Here are all the environment variables you need to set (which you can alternatively **define in an `.env` in the application root directory**):
```
QBT_HOST = localhost
QBT_PORT = 8080
QBT_USER = admin
QBT_PASS = adminadmin
FEEDS_FILE = ../feeds.json
LOGS_DIR = logs
LOGS_CONSOLE = false
LOGS_LEVEL = warning
```

## How to use
The first thing you need to do in order to use this, is to setup the different RSS sources you want to fetch your torrents from.

### The "feeds" file
This is a sample of the `feeds.json` file which I hope is self-explanatory on how to configure the different RSS feeds of torrents.
As you can see, you can add as many RSS sources as you like, and you can even configure filters per-field of the RSS file.

```json
{
  "feeds": [
    {
      "name": "The New Books",
      "url": "http://rss.domain.example/author/some-guy.rss",
      "savepath": "/mnt/hd/books/Some Guy",
      "category": "Books",
      "filters": [
        {
          "field": "title",
          "regex": ".*epub.*"
         }
      ]
    },
    { ... }
  ]
}
```
### Running
In order to run the command, you just need to call this:
```
node cli fetch
```

#### Crontab
It is usually very helpful to have the command to run automatically on its own, and that is where crontab in Linux comes in handy.

Here is an example on how to set it up
``` 
# RSS automatic torrents download with qBittorrent
0,30 * * * * cd /home/qbittorrent-auto-rss; /usr/bin/node cli fetch &> /tmp/cron_qbtrss.log
```

## Commands Reference

### --version
Version of the application
```
node cli --version
node cli -v
```

### qBittorrent version
Version of the qBittorrent the app connects to
```
node cli qbtversion
```

### fetch
Start the fetch process of the torrents based on the RSS feeds configured in the `feeds.json` file. Optionally you can pass the path to the `feeds.json` file.
```
node cli fetch
node cli fetch --fetch /path/to/feeds.json
node cli fetch -f /path/to/feeds.json
```
