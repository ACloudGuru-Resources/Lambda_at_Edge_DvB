'use strict';
const prettyjson = require('prettyjson');

const experimentTraffic = 0.5;

exports.handler = (event, context, callback) => {
  console.log(prettyjson.render(event, {noColor: true}));
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const cookies = cookiesToObject(headers.cookie);
  console.log(prettyjson.render(cookies, {noColor: true}));

  if (request.uri !== '/experiment.gif' || cookies['X-Experiment-Name']) {
    // do not process if this is not an A-B test request
    callback(null, request);
    return;
  }

  console.log('Experiment cookie not found. Throwing dice...');
  const cookie =
    Math.random() < experimentTraffic
      ? 'X-Experiment-Name=A'
      : 'X-Experiment-Name=B';
  console.log(`Adding cookie header: ${cookie}`);
  headers.cookie = headers.cookie || [];
  headers.cookie.push({ key: 'Cookie', value: cookie });

  callback(null, request);
};

const cookiesToObject = array =>
  array
    ? array.reduce((obj, item) => {
        if (item.key === 'cookie') {
          return item.value.split('; ').reduce((o, i) => {
            const kV = i.split('=');
            return { ...o, [kV[0]]: kV[1] };
          }, {});
        } else {
          return obj;
        }
      }, {})
    : {};
