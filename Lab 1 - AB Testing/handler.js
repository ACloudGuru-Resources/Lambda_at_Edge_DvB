'use strict';

const cookiesToObject = (array) =>
array.reduce((obj, item) => {
  const arr = item.split('=');
  obj[arr[0]] = arr[1];
  return obj
}, {});

/* This is an viewer request function */
exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const cookiesObj = cookiesToObject(headers.cookie);

    if (request.uri !== '/experiment.gif') {
        // do not process if this is not an A-B test request
        callback(null, request);
        return;
    }

    const cookieExperimentA = 'X-Experiment-Name=A';
    const cookieExperimentB = 'X-Experiment-Name=B';
    const pathExperimentA = '/a-control.gif';
    const pathExperimentB = '/b-treatment.gif';
  
    let experimentUri;
    if (headers.cookie) {
      if (cookiesObj['X-Experiment-Name'] === 'A') {
          console.log('Experiment A cookie found');
          experimentUri = pathExperimentA;
      } else if (cookiesObj['X-Experiment-Name'] === 'B') {
          console.log('Experiment B cookie found');
          experimentUri = pathExperimentB;
      }
    }

    if (!experimentUri) {
        console.log('Experiment cookie not found. Throwing dice...');
        if (Math.random() < 0.75) {
            experimentUri = pathExperimentA;
        } else {
            experimentUri = pathExperimentB;
        }
    }

    request.uri = experimentUri;
    console.log(`Request uri set to "${request.uri}"`);
    callback(null, request);
};