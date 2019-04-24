const assert = require("assert");
const { postVote } = require("../post-vote");
const { handleSqsMessages } = require("../handle-votes");
let testApiEventData;


describe("Post a vote", () => {

  beforeEach(() => {
    testApiEventData = require("./test-data/example-api-request.json");
  });

  describe("with correct query string params", () => {
    it("should return 200 with something in the body", async () => {
      const result = await postVote(testApiEventData);
      assert(result.statusCode === 200);
      assert(result.body !== null);
    });
  });

  describe("with incorrect query string params", () => {
    it("should return 400 with an error property in the body", async () => {
      testApiEventData.queryStringParameters = null;
      const result = await postVote(testApiEventData);
      assert(result.statusCode === 400);
      assert(result.body && result.body.error);
    });
  });

});

describe("Handle a vote message", () => {
  it("should return 0", async () => {
    const result = await handleSqsMessages();
    assert(result === 0);
  });
});