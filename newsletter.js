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
        if (err) reject(err)

        var $ = cheerio.load(body)
        this.title = $('title').text()

        $('html').replaceWith($('tbody'))
        $('tbody').remove(':nth-child(-n+4)')
        $('tbody').remove(':last-child')
        $('[title]').attr("title", (_, currentVal) => currentVal.replace(/"|'|`/g, "&apos;"))
        $('a > img').parent().after('<p></p')

        var turndownService = new TurndownService()
        this.markdown = turndownService.turndown($.html())

        resolve(this)
      })
    })
  }

  from_mail (data, date) {
    return new Promise((resolve, reject) => {
      mailparser(data, (err, mail) => {
        if (err) reject(err)

        var $ = cheerio.load(mail.html)
        var href = $('a[href^="https://mailchi.mp/"]').attr('href')
        if (!href) href = $('a[href^="http://mailchi.mp/"]').attr('href')
        var link = href.replace(/\?e\=.*/, '')

        this.from_link(link).then((title, markdown) => {
          resolve(this)
        })
      })
    })
  }
}
