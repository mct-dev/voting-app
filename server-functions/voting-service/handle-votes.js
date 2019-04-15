'use strict';
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

module.exports.handleSqsMessages = async (event) => {

  let sqs = new AWS.SQS({apiVersion: '2012-11-05'});

  try {
    let queueUrl = await sqs.getQueueUrl({
      QueueName: 'voting-app-queue'
    }).promise();
    let { Messages } = await sqs.receiveMessage({
      QueueUrl: queueUrl.QueueUrl,
      WaitTimeSeconds: 5,
      MaxNumberOfMessages: 10
    }).promise();

    if (Messages.length) l
      Messages.forEach(msg => { 
        let msgId = msg.MessageId;
        let msgBody = msg.Body;
        console.log('Message ID: ', msgId);
        console.log('Message Body: ', msgBody);

        // TODO: add to DB here

      })
      return {
        statusCode: 200,
        body: JSON.stringify(Messages)
      }
  }
  catch (err) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: err
      })
    }
  }
};
