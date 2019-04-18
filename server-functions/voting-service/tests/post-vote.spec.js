const { postVote } = require('../post-vote');
const testApiEvent = require('./test-data/example-api-request.json');

postVote(testApiEvent);