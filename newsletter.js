var fs = require('fs')
var mailparser = require('mailparser').simpleParser
var request = require('request')
var cheerio = require('cheerio')
var TurndownService = require('turndown')

module.exports = class Newsletter {
  constructor () {
    this.title
    this.markdown
  }

  from_link (link, date) {
    return new Promise((resolve, reject) => {
      request(link, (err, res, body) => {
        var $ = cheerio.load(body)
        this.title = $('title').text()

        $('html').replaceWith($('tbody'))
        $('tbody').remove(':nth-child(-n+4)')
        $('tbody').remove(':last-child')

        var turndownService = new TurndownService()
        this.markdown = turndownService.turndown($.html())

        resolve(this)
      })
    })
  }

  from_mail (data, date) {
    return new Promise((resolve, reject) => {
      mailparser(data, (err, mail) => {
        var $ = cheerio.load(mail.html)
        var link = $('a[href^="http://mailchi.mp/"]').attr('href').replace(/\?e\=.*/, '')

        this.from_link(link).then((title, markdown) => {
          resolve(this)
        })
      })
    })
  }

  from_file (file, date) {
    return new Promise((resolve, reject) => {
      fs.readFile(__dirname + file, (err, data) => {
        this.from_mail(data).then((title, markdown) => {
          resolve(this)
        })
      })
    })
  }
}
