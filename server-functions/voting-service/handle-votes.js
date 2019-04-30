"use strict";
const AWS = require("aws-sdk");
const sqs = new AWS.SQS({apiVersion: "2012-11-05"});
const db = new AWS.DynamoDB.DocumentClient({apiVersion: "2012-08-10"});

AWS.config.update({region: "us-east-1"});

const getQueueUrl = async () => {
  let queueUrlResponse = await sqs.getQueueUrl({
    QueueName: process.env.SQS_QUEUE_NAME
  }).promise();

  return queueUrlResponse.QueueUrl;
};

const getMessages = async (queueUrl) => {
  let messagesResponse = await sqs.receiveMessage({
    QueueUrl: queueUrl,
    WaitTimeSeconds: 5,
    MaxNumberOfMessages: 10
  }).promise();

  return messagesResponse && messagesResponse.Messages
    ? messagesResponse.Messages
    : [];
};

module.exports.handleSqsMessages = async () => {
  const dbTableName = process.env.DYNAMODB_TABLE;
  const sqsQueueName = "voting-app-queue";
  const timestamp = new Date().getTime();

  let queueUrl = await getQueueUrl(sqsQueueName);
  let messages = await getMessages(queueUrl);

  if (!messages.length) {
    return 0;
  }

  for (let msg of messages) {
    let msgId = msg.MessageId;
    let msgBody = JSON.parse(msg.Body);

    if (!(msgId && msgBody)) {
      break;
    }

    await db.put({
      TableName: dbTableName,
      Item: {
        id: msgId,
        VoteData: msgBody,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    }).promise();

    let deleteResponse = await sqs.deleteMessage({
      QueueUrl: queueUrl,
      ReceiptHandle: msg.ReceiptHandle
    }).promise();

    if (deleteResponse) {
      // `console` will log to CloudWatch automatically
      console.log(`Message deleted from SQS Queue. Queue URL: ${queueUrl} | Message Receipt Handle: ${msg.ReceiptHandle}`);
    }
  }

  return 0;
};
