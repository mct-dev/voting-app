# A serverless pipeline for submitting votes
A simple pipeline for submitting voting data built with the [serverless framework](https://serverless.com).

## TLDR
This project was a quick case study of how to create a pipeline for handling and storing a high-volume input of data.  The example used for the case study was that of a "voting service" where thousands of users might be voting on a wide variety of topics.

Includes:
 - an AWS DynamoDB table
 - a POST API endpoint and associated AWS Lambda function
 - a second AWS Lambda function which will process and handle the vote data
 - an AWS SQS Queue used to decouple the "receiving" and "processing" sections of our pipeline
 - an AWS SNS Topic used to notify the second Lambda function when an SQS Message is ready to process

## Summary

---

### Helpful links
https://serverless.com/framework/docs/providers/aws/events/sqs/
https://serverless.com/framework/docs/providers/aws/events/sqs/