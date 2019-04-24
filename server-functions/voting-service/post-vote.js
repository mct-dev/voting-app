"use strict";
const AWS = require("aws-sdk");
const parseEventData = (apiEventData) => {
  if (typeof apiEventData !== "object" || !apiEventData.queryStringParameters) {

    throw new Error("Incorrect data format.");

  }

  return apiEventData.queryStringParameters;
};

AWS.config.update({region: "us-east-1"});

/**
 * Function accepts event data from AWS API Gateway endpoint.
 * This endpoint should use the "LAMBDA_PROXY" Type, providing
 * the HTTP request details as well as the query string parameters
 * in the `event` parameter.
 */
module.exports.postVote = async (event, context) => {
  let sqs = new AWS.SQS({apiVersion: "2012-11-05"});
  let voteQueueUrl;
  let sqsMessageResponse;
  let voteData;

  try {
    voteData = parseEventData(event);
  }
  catch (err) {
    return {
      statusCode: 400,
      body: { error: err }
    };
  }

  try {
    voteQueueUrl = await sqs.getQueueUrl({
      QueueName: "voting-app-queue",
    }).promise();

    sqsMessageResponse = await sqs.sendMessage({
      MessageBody: JSON.stringify(voteData),
      QueueUrl: voteQueueUrl.QueueUrl
    }).promise();
  }
  catch (err) {
    return {
      statusCode: 500,
      body: { error: err }
    };
  }

  return {
    statusCode: 200,
    body: {
      voteQueueUrl,
      sqsMessageResponse,
      input: event
    }
  };
};
