"use strict";
const AWS = require("aws-sdk");
const sqs = new AWS.SQS({apiVersion: "2012-11-05"});
const db = new AWS.DynamoDB.DocumentClient({apiVersion: "2012-08-10"});
const dbTableName = "VotingDB";
const sqsQueueName = "voting-app-queue";

AWS.config.update({region: "us-east-1"});

const getQueueUrl = async (queueName) => {

  let queueUrlResponse = await sqs.getQueueUrl({
    QueueName: queueName
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

module.exports.handleSqsMessages = async (event) => {
  let queueUrl;
  let messages;
  let deleteResponse;
  let msgId;
  let msgBody;

  try {

    queueUrl = await getQueueUrl(sqsQueueName);
    messages = await getMessages(queueUrl);
    if (messages.length)

      for (let msg of messages) {

        msgId = msg.MessageId;
        msgBody = JSON.parse(msg.Body);

        if (!(msgId && msgBody)) {
          break;
        }

        await db.put({
          TableName: dbTableName,
          Item: {
            VoteId: msgId,
            VoteData: msgBody,
          }
        }).promise();

        deleteResponse = await sqs.deleteMessage({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle
        }).promise();

        console.log(`Message deleted from Dynamo DB. Table: ${dbTableName} | Message Id: ${msgId}`);

      }

    return 0;
  }
  catch (err) {
    console.error(err);
    return 1;
  }
};
