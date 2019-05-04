const fetch = require("node-fetch");

for (let i = 0; i< 10; i++) {
  let voteQuestionValue = `Question${Math.floor(Math.random() * 1000)}`;
  let voteAnswerValue = `Answer${Math.floor(Math.random() * 1000)}`;

  let baseUrl = "https://qkgqzk4wse.execute-api.us-east-1.amazonaws.com/dev/vote";
  let url = `${baseUrl}?VoteQuestion=${voteQuestionValue}&VoteAnswer=${voteAnswerValue}`;

  fetch(url, { method: "POST" })
    .then(res => res.json())
    .then(json => console.log(json.message))
    .catch(err => console.log(err));

}