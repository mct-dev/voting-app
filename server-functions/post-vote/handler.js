'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

module.exports.postVote= async (event, context) => {
  const sqs = AWS.SQS({apiVersion: '2012-11-05'});
  const votesQueue = sqs.get
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
