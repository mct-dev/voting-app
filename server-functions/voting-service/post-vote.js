"use strict";
const AWS = require("aws-sdk");
const parseEventData = (apiEventData) => {

  // data should be passed in through query string params
  if (apiEventData.queryStringParameters) {
    return apiEventData.queryStringParameters;
  }

  return null;
};

AWS.config.update({region: "us-east-1"});

/**
 * Function accepts event data from AWS API Gateway endpoint.
 * This endpoint should use the "LAMBDA_PROXY" Type, providing
 * the HTTP request details as well as the query string parameters
 * in the `event` parameter.
 */
module.exports.postVote = async (event) => {
  let sqs = new AWS.SQS({apiVersion: "2012-11-05"});
  let voteQueueUrl;
  let sqsMessageResponse;
  let voteData;

  voteData = parseEventData(event);

  if (!voteData) {
    return {
      "statusCode": 500,
      "isBase64Encoded": false,
      "headers": {
        "Content-Type": "text/plain"
      },
      "body": JSON.stringify({
        error: {
          message: "No query string parameters were found!"
        },
        input: event
      })
    };

  }
  voteQueueUrl = await sqs.getQueueUrl({
    QueueName: process.env.SQS_QUEUE_NAME,
  }).promise();

  sqsMessageResponse = await sqs.sendMessage({
    MessageBody: JSON.stringify(voteData),
    QueueUrl: voteQueueUrl.QueueUrl
  }).promise();

  return {
    "statusCode": 200,
    "headers": {
      "Content-Type": "text/plain"
    },
    "isBase64Encoded": false,
    "body": JSON.stringify({
      voteQueueUrl,
      sqsMessageResponse,
      input: event
    })
  };
};
