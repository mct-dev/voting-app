# A serverless pipeline for submitting votes
A simple pipeline for submitting voting data built with the [serverless framework](https://serverless.com).

## Summary
This project was a quick case study of how to create a pipeline for handling and storing a high-volume input of data. The example used for the case study was that of a "voting service" where thousands of users might be voting on a wide variety of topics. The solution for handling these votes was a cloud-based pipeline of serverless functions, a messaging queue, a notification service, and a NoSQL database.

Pipeline ingredients:
 - an AWS DynamoDB table
 - a POST API endpoint and associated AWS Lambda function
 - a second AWS Lambda function which will process and handle the vote data
 - an AWS SQS Queue used to decouple the "receiving" and "processing" sections of our pipeline
 - an AWS SNS Topic used to notify the second Lambda function when an SQS Message is ready to process

### Install
 - `npm install`

### Build
 - No build needed here. It's serverless!

### Test
 - WIP

### Deploy
 - Deploy functions: `npm run deploy:functions`
 - Deploy database (if it doesn't exist already): `npm run deploy:db`