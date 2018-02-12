var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var Newsletter = require('./newsletter')
var request = require('request')

exports.handler = (event, context, callback) => {
  console.log('Process tl;dr email')

  var sesNotification = event.Records[0].ses
  console.log('SES Notification:\n', JSON.stringify(sesNotification, null, 2))

  s3.getObject({
    Bucket: process.env.DISCOURSE_TLDR_BUCKET,
    Key: sesNotification.mail.messageId
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack)
      callback(err)
    } else {
      console.log('Raw email fetched from S3')

      new Newsletter().from_mail(data.Body).then(self => {
        console.log('Posting: ' + self.title)
        data = {
          api_key: process.env.DISCOURSE_TLDR_API_KEY,
          api_username: process.env.DISCOURSE_TLDR_API_USERNAME,
          title: self.title,
          raw: self.markdown,
          category: process.env.DISCOURSE_TLDR_CATEGORY
        }
        request.post(${process.env.DISCOURSE_TLDR_URL} + '/posts', { form: data }, (err, res, body) => {
          if (res.statusCode != 200) {
            console.log('Posting to Discourse failed: ' + body)
            callback(body)
          }
        })
      }).catch(err => {
        console.log(err)
        callback(err)
      })

      callback(null, null)
    }
  })
}
