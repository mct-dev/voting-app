'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

const badDataErrorResponse = (err) => {
  return {
    statusCode: 400,
    body: { error: err }
  };
}

const serverErrorResponse = (err) => {
  return {
    statusCode: 500,
    body: { error: err }
  };
}

const parseEventData = (apiEventData) => {
  if (typeof apiEventData !== 'object' || !apiEventData.queryStringParameters) throw new Error('Incorrect data format.')
  return apiEventData.queryStringParameters;
}

/**
 * Function accepts event data from AWS API Gateway endpoint.
 * This endpoint should use the "LAMBDA_PROXY" Type, providing
 * the HTTP request details as well as the query string parameters.
 */
module.exports.postVote = async (event, context) => {
  let sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  let voteQueueUrl;
  let sqsMessageResponse;

  try {
    let voteData = parseEventData(event);
    voteQueueUrl = await sqs.getQueueUrl({
        QueueName: 'voting-app-queue',
    }).promise();
    sqsMessageResponse = await sqs.sendMessage({
      MessageBody: JSON.stringify(voteData),
      QueueUrl: voteQueueUrl.QueueUrl
    }).promise()
  }
  catch (err) {
    return {
      statusCode: 500,
      body: {
        error: err.stack
      }
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
