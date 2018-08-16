'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');
const prettyjson = require('prettyjson');

const URI_REGEX = /^\/(?:(.*\/)?)((?:[wh]_\d{2,4})(?:,[wh]_\d{2,4})*)\/((.*).(\w{3,4}))$/;

exports.handler = (event, context, callback) => {
  // Set this to your bucket name if it does not auto-resolve
  // context.functionName = dvb-image-resizer-originResponse
  // bucketname = dvb-image-resizer-bucket
  const BUCKET = context.functionName
    .replace('-originResponse', '-bucket')
    .replace('us-east-1.', '');
  console.log('context.functionName', context.functionName);
  console.log('BUCKET', BUCKET);

  let response = event.Records[0].cf.response;
  let request = event.Records[0].cf.request;
  console.log(prettyjson.render(event, { noColor: true }));

  //check if image is not present
  if (response.status == 404) {
    const path = request.uri, // Ex: uri /images/w_100,h_100/image.jpg
      match = path.match(URI_REGEX), // /(.*)\/(\d+)x(\d+)\/(.*)\/(.*)/
      key = match[0].substring(1),
      prefix = match[1],
      transforms = match[2].split(','),
      width = parseInt(transforms[0].substring(2), 10),
      height = parseInt(transforms[1].substring(2), 10),
      requiredFormat = match[5] == 'jpg' ? 'jpeg' : match[4],
      imageName = match[3],
      originalKey = prefix + imageName;

    // get the source image file
    S3.getObject({ Bucket: BUCKET, Key: originalKey })
      .promise()
      // perform the resize operation
      .then(data =>
        Sharp(data.Body)
          .resize(width, height)
          .toFormat(requiredFormat)
          .toBuffer(),
      )
      .then(buffer => {
        // save the resized object to S3 bucket with appropriate object key.
        S3.putObject({
          Body: buffer,
          Bucket: BUCKET,
          ContentType: 'image/' + requiredFormat,
          CacheControl: 'max-age=31536000',
          Key: key,
          StorageClass: 'STANDARD',
        })
          .promise()
          // even if there is exception in saving the object we send back the generated
          // image back to viewer below
          .catch(() => {
            console.log('Exception while writing resized image to bucket');
          });

        // generate a binary response with resized image
        response.status = 200;
        response.body = buffer.toString('base64');
        response.bodyEncoding = 'base64';
        response.headers['content-type'] = [
          { key: 'Content-Type', value: 'image/' + requiredFormat },
        ];
        callback(null, response);
      })
      .catch(err => {
        console.log('Exception while reading source image :%j', err);
      });
  } // end of if block checking response statusCode
  else {
    // allow the response to pass through
    callback(null, response);
  }
};
