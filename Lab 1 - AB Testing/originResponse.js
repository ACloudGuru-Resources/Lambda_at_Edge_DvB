'use strict';

/* This is an origin request function */
exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const response = event.Records[0].cf.response;

  console.log('headers', headers);
  const cookies = cookiesToObject(headers.cookie);
  console.log('cookies', cookies);

  headers.cookie = headers.cookie || [];
  if (headers.cookie && response) {
    if (cookies['X-Experiment-Name'] === 'A') {
      console.log('Experiment A cookie found');
      console.log(`Adding cookie header: X-Experiment-Name=A`);
      setCookie(response, 'X-Experiment-Name=A');
    } else if (cookies['X-Experiment-Name'] === 'B') {
      console.log('Experiment B cookie found');
      console.log(`Adding cookie header: X-Experiment-Name=B`);
      setCookie(response, 'X-Experiment-Name=B');
    }
  }

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
