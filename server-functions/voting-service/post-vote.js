'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

module.exports.postVote= async (event, context) => {
  let sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  let voteQueueUrl;
  let sqsMessageResponse;

  try {
    voteQueueUrl = await sqs.getQueueUrl({
        QueueName: 'voting-app-queue',
    }).promise();
    sqsMessageResponse = await sqs.sendMessage({
      MessageBody: JSON.stringify(event),
      QueueUrl: voteQueueUrl.QueueUrl
    }).promise()
  }
  catch (err) {
    return {
      statusCode: 404,
      body: JSON.stringify(err)
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      voteQueueUrl,
      sqsMessageResponse,
      input: event,
    }),
  };
};
