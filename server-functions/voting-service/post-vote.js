'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

const parseEventData = (apiEventData) => {
  if (typeof apiEventData !== 'object' || !apiEventData.queryStringParameters) {

    throw new Error('Incorrect data format.')

  }

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
  let voteData;

  let returnData = {
    statusCode: 200,
    body: {}
  };

  try {

    voteData = parseEventData(event);

  }
  catch (err) {

    returnData.statusCode = 400;
    returnData.body = {
      error: err
    }

    return returnData;
  }

  try {

    voteQueueUrl = await sqs.getQueueUrl({
        QueueName: 'voting-app-queue',
    }).promise();

    sqsMessageResponse = await sqs.sendMessage({
      MessageBody: JSON.stringify(voteData),
      QueueUrl: voteQueueUrl.QueueUrl
    }).promise()

  }
  catch (err) {

    returnData.statusCode = 500;
    returnData.body = {
      error: err
    }

    return returnData;
  }

  returnData.body = {
    voteQueueUrl,
    sqsMessageResponse,
    input: event
  }

  return returnData;
};
