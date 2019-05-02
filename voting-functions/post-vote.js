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

module.exports.postVote = async (event) => {
  const sqs = new AWS.SQS({apiVersion: "2012-11-05"});
  const sns = new AWS.SNS({apiVersion: "2010-03-31"});
  let snsPublishPromise;
  let voteQueueUrl;
  let sqsMessageResponse;
  let voteData;

  voteData = parseEventData(event);

  if (!voteData) {
    return {
      statusCode: 500,
      isBase64Encoded: false,
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify({
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

  // notify our second function that there's a new vote to handle
  snsPublishPromise = await sns.publish({
    Message: "New Vote Posted!",
    TopicArn: process.env.SNS_TOPIC_ARN
  });

  if (snsPublishPromise) {
    console.log("SNS publish returned: ", snsPublishPromise);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain"
    },
    isBase64Encoded: false,
    body: JSON.stringify({
      voteQueueUrl,
      sqsMessageResponse,
      input: event
    })
  };
};
