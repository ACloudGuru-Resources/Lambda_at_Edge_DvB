module.exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  console.log('headers', headers);

  callback(null, request);
};
