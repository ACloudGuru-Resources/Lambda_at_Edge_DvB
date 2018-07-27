'use strict';

/* This is an origin request function */
exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  console.log('headers', headers);
  const cookies = cookiesToObject(headers.cookie);
  console.log('cookies', cookies);

  if (request.uri !== '/experiment.gif') {
    // do not process if this is not an A-B test request
    callback(null, request);
    return;
  }

  const pathExperimentA = '/a-control.gif';
  const pathExperimentB = '/b-treatment.gif';

  let experimentUri;
  if (headers.cookie) {
    if (cookies['X-Experiment-Name'] === 'A') {
      console.log('Experiment A cookie found');
      experimentUri = pathExperimentA;
    } else if (cookies['X-Experiment-Name'] === 'B') {
      console.log('Experiment B cookie found');
      experimentUri = pathExperimentB;
    }
  }

  if (!experimentUri) {
    console.log('Experiment cookie not found. Throwing dice...');
    if (Math.random() < 0.5) {
      experimentUri = pathExperimentA;
    } else {
      experimentUri = pathExperimentB;
    }
  }

  request.uri = experimentUri;
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
