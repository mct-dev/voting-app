'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

module.exports.postVote= async (event, context) => {
  let sqs = AWS.SQS({apiVersion: '2012-11-05'});
  let urlparams = {
    QueueName: 'voting-app-queue',
    // QueueOwnerAwsAccountId: ''
  };
  let voteQueueUrl;


  try {
    voteQueueUrl = await sqs.getQueueUrl(urlparams).promise();


  }
  catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify(err)
    }
  }
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
