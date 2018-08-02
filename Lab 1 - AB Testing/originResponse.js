'use strict';

const prettyjson = require('prettyjson');

exports.handler = (event, context, callback) => {
  console.log(prettyjson.render(event, {noColor: true}));

  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const response = event.Records[0].cf.response;
  const cookies = cookiesToObject(headers.cookie);
  const experimentLetter = cookies['X-Experiment-Name'];

  if (!cookies['X-Experiment-Name']) {
    // do not process if this is not an A-B test request
    callback(null, response);
    return;
  }

  console.log(`Experiment ${experimentLetter} cookie found`);
  console.log(`Adding cookie header: X-Experiment-Name=${experimentLetter}`);
  setCookie(response,`X-Experiment-Name=${experimentLetter}`);

  callback(null, response);
};

const setCookie = function(response, cookie) {
  const cookieValue = `${cookie}; Path='/'`;
  console.log(`Setting cookie ${cookieValue}`);
  response.headers['set-cookie'] = [{ key: 'Set-Cookie', value: cookieValue }];
};

const cookiesToObject = array =>
  array
    ? array.reduce((obj, item) => {
        if (item.key === 'Cookie') {
          return item.value.split('; ').reduce((o, i) => {
            const kV = i.split('=');
            return { ...o, [kV[0]]: kV[1] };
          }, {});
        } else {
          return obj;
        }
      }, {})
    : {};
