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
  let canProcessMessages = true;

  while (canProcessMessages) {
    let messages = await getMessages(queueUrl);

    if (!messages || !messages.length) {
      console.log(`No messages found in queue ${sqsQueueName}.`);
      canProcessMessages = false;
      return 0;
    }

    for (let msg of messages) {
      let msgId = msg.MessageId;
      let msgBody = JSON.parse(msg.Body);

      if (!(msgId && msgBody)) {
        // go to next message
        continue;
      }
      
      console.log(`processing message (id: ${msgId})`);

      try {
        await db.put({
          TableName: dbTableName,
          Item: {
            id: msgId,
            VoteData: msgBody,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        }).promise();

        console.log(`DB PUT successful! Message Id: ${msgId}`);
      } catch (err) {
        console.error(`DB PUT failed! Message Id: ${msgId}. Error: ${err}`);
      }

      try {
        await sqs.deleteMessage({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle
        }).promise();

        console.log(`Message deleted from SQS Queue. Queue URL: ${queueUrl} | Message Receipt Handle: ${msg.ReceiptHandle}`);
      } catch (err) {
        console.error(`Message deletion FAILED. Message Receipt Handle: ${msg.ReceiptHandle}. Error: ${err}`);
      }
    }
  }

  return 0;
};
