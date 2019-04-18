'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

module.exports.handleSqsMessages = async (event) => {

  let sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  let db = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
  const dbTableName = 'VotingDB';

  try {
    let queueUrlResponse = await sqs.getQueueUrl({
      QueueName: 'voting-app-queue'
    }).promise();
    let messagesResponse = await sqs.receiveMessage({
      QueueUrl: queueUrlResponse.QueueUrl,
      WaitTimeSeconds: 5,
      MaxNumberOfMessages: 10
    }).promise();

    const messages = messagesResponse.Messages ? messagesResponse.Messages : [];

    if (messages.length)
      for (let msg of messages) {
        let msgId = msg.MessageId;
        let msgBody = JSON.parse(msg.Body);

        if (!(msgId && msgBody)) {
          break;
        }

        // any success here implies a correct put to DB
        await db.put({
          TableName: dbTableName,
          Item: {
            VoteId: msgId,
            VoteData: msgBody,
          }
        }).promise();

        let deleteResponse = await sqs.deleteMessage({
          QueueUrl: queueUrlResponse.QueueUrl,
          ReceiptHandle: msg.ReceiptHandle
        }).promise();

        console.log(`Message deleted from Dynamo DB. Table: ${dbTableName} | Message Id: ${msgId}`);

      }

      return {
        statusCode: 200,
      }
  }
  catch (err) {
    return {
      statusCode: 500,
      body: {
        error: err.stack
      }
    }
  }
};
