'use strict';

/* This is an origin request function */
exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  if (
    headers['cloudfront-viewer-country'] &&
    headers['cloudfront-viewer-country'][0].value
  ) {
    const countryCode = headers['cloudfront-viewer-country'][0].value;
    const response = {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'cache-control': [
          {
            key: 'Cache-Control',
            value: 'max-age=100',
          },
        ],
        'content-type': [
          {
            key: 'Content-Type',
            value: 'text/html',
          },
        ],
        'content-encoding': [
          {
            key: 'Content-Encoding',
            value: 'UTF-8',
          },
        ],
      },
      body: `
        <!DOCTYPE html />
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>ACG Lambda@Edge: Hello Country!</title>
        </head>
        <body>
            <h1>Hello ${countryCode} from Lambda@Edge!</h1>
        </body>
        </html>
      `,
    };

    callback(null, response);
  }

  callback(null, request);
};
