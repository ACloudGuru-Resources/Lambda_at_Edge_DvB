'use strict';

exports.handler = (event, context, callback) => {
  console.log('event', event);
  
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const cookies = cookiesToObject(headers.cookie);
  const experimentLetter = cookies['X-Experiment-Name'];
  const experimentPaths = {
    A: '/a-control.gif',
    B: '/b-treatment.gif',
  };

  if (request.uri !== '/experiment.gif') {
    // do not process if this is not an A-B test request
    callback(null, request);
    return;
  }

  request.uri = experimentPaths[experimentLetter] || request.uri;
  console.log(`Request uri set to "${request.uri}"`);
  callback(null, request);
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
