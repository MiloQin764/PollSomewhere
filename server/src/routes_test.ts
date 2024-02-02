import * as assert from "assert";
import * as httpMocks from "node-mocks-http";
import { addPoll, getPollDetails, getResult, list, vote } from "./routes";

describe("routes", function () {
  it("add", function () {
    // first branch, straight line code, case 1
    const req1 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { minutes: 1 },
    });
    const res1 = httpMocks.createResponse();
    addPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(
      res1._getData(),
      'missing or invalid "name" parameter'
    );

    // first branch, straight line code, case 2
    const req2 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: 3, minutes: 1 },
    });
    const res2 = httpMocks.createResponse();
    addPoll(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(
      res2._getData(),
      'missing or invalid "name" parameter'
    );

    // second branch, straight line code, case 1 only
    const req3 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: "2" },
    });
    const res3 = httpMocks.createResponse();
    addPoll(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(
      res3._getData(),
      `'minutes' is not a number: ${req3.body.minutes}`
    );

    // third branch, straight line code, case 1
    const req4 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: -1 },
    });
    const res4 = httpMocks.createResponse();
    addPoll(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(
      res4._getData(),
      `'minutes' is not a positive integer: ${req4.body.minutes}`
    );

    // third branch, straight line code, case 2
    const req5 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3.1 },
    });
    const res5 = httpMocks.createResponse();
    addPoll(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(
      res5._getData(),
      `'minutes' is not a positive integer: ${req5.body.minutes}`
    );

    // 4th branch, straight line code, case 1
    const req6 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3, options: "apple" },
    });
    const res6 = httpMocks.createResponse();
    addPoll(req6, res6);
    assert.strictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(res6._getData(), '"options" is not an array');

    // 4th branch, straight line code, case 2
    const req8 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3, options: 4 },
    });
    const res8 = httpMocks.createResponse();
    addPoll(req8, res8);
    assert.strictEqual(res8._getStatusCode(), 400);
    assert.deepStrictEqual(res8._getData(), '"options" is not an array');

    // 5th branch, straight line code, case 1
    const req7 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3, options: ["apple"] },
    });
    const res7 = httpMocks.createResponse();
    addPoll(req7, res7);
    assert.strictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(
      res7._getData(),
      `'options' has length < 2, options.length: ${req7.body.options.length}`
    );

    // 5th branch, straight line code, case 2
    const req9 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3, options: [] },
    });
    const res9 = httpMocks.createResponse();
    addPoll(req9, res9);
    assert.strictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(
      res9._getData(),
      `'options' has length < 2, options.length: ${req9.body.options.length}`
    );

    // 6th branch, straight line code, case 1
    const req10 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3, options: ["apple", "banana"] },
    });
    const res10 = httpMocks.createResponse();
    addPoll(req10, res10);
    assert.strictEqual(res10._getStatusCode(), 200);
    assert.deepStrictEqual(res10._getData().added, true);

    // 6th branch, straight line code, case 2
    const req11 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "milo", minutes: 5, options: ["lp", "ish"] },
    });
    const res11 = httpMocks.createResponse();
    addPoll(req11, res11);
    assert.strictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getData().added, true);

    // 7th branch, straight line code, case 1
    const req12 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "kei", minutes: 3, options: ["apple", "banana"] },
    });
    const res12 = httpMocks.createResponse();
    addPoll(req12, res12);
    assert.strictEqual(res12._getStatusCode(), 200);
    assert.deepStrictEqual(res12._getData().added, false);

    // 7th branch, straight line code, case 2
    const req13 = httpMocks.createRequest({
      method: "POST",
      url: "/api/add",
      body: { name: "milo", minutes: 5, options: ["lp", "ish"] },
    });
    const res13 = httpMocks.createResponse();
    addPoll(req13, res13);
    assert.strictEqual(res13._getStatusCode(), 200);
    assert.deepStrictEqual(res13._getData().added, false);
  });

  it("list", function () {
    // only branch, straght line code, only case
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/api/list",
    });
    const res = httpMocks.createResponse();
    list(req, res);
    assert.strictEqual(res._getStatusCode(), 200);
    assert.deepStrictEqual(res._getData().polls, getPollDetails());
  });

  it("vote", function () {
    // first branch, straight line code, case 1
    const req1 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "", voterName: "A", option: "lp" },
    });
    const res1 = httpMocks.createResponse();
    vote(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(
      res1._getData(),
      'missing or invalid "name" parameter'
    );

    // first branch, straight line code, case 2
    const req2 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: 2, voterName: "A", option: "lp" },
    });
    const res2 = httpMocks.createResponse();
    vote(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(
      res2._getData(),
      'missing or invalid "name" parameter'
    );

    // second branch, straight line code, case 1
    const req3 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: "", option: "lp" },
    });
    const res3 = httpMocks.createResponse();
    vote(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(
      res3._getData(),
      'missing or invalid "voterName" parameter'
    );

    // second branch, straight line code, case 2
    const req4 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: 2, option: "lp" },
    });
    const res4 = httpMocks.createResponse();
    vote(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(
      res4._getData(),
      'missing or invalid "voterName" parameter'
    );

    // third branch, straight line code, case 1
    const req5 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: "A", option: "l" },
    });
    const res5 = httpMocks.createResponse();
    vote(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(
      res5._getData(),
      'missing or invalid "option" parameter'
    );

    // third branch, straight line code, case 2
    const req6 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: "A", option: "" },
    });
    const res6 = httpMocks.createResponse();
    vote(req6, res6);
    assert.strictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(
      res6._getData(),
      'missing or invalid "option" parameter'
    );
    // 4th branch, straight line code, case 1
    const req7 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "eat?", voterName: "A", option: "lp" },
    });
    const res7 = httpMocks.createResponse();
    vote(req7, res7);
    assert.strictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(
      res7._getData(),
      `poll does not exist ${req7.body.name}`
    );

    // 4th branch, straight line code, case 2
    const req8 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "ewa?", voterName: "A", option: "lp" },
    });
    const res8 = httpMocks.createResponse();
    vote(req8, res8);
    assert.strictEqual(res8._getStatusCode(), 400);
    assert.deepStrictEqual(
      res8._getData(),
      `poll does not exist ${req8.body.name}`
    );

    // 5th branch, straight line code, case 1
    const req9 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: "A", option: "lp" },
    });
    const res9 = httpMocks.createResponse();
    vote(req9, res9);
    assert.strictEqual(res9._getStatusCode(), 200);
    assert.deepStrictEqual(res9._getData().replaced, false);

    // 5th branch, straight line code, case 2
    const req10 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "kei", voterName: "B", option: "apple" },
    });
    const res10 = httpMocks.createResponse();
    vote(req10, res10);
    assert.strictEqual(res10._getStatusCode(), 200);
    assert.deepStrictEqual(res10._getData().replaced, false);

    // 6th branch, straight line code, case 1
    const req11 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: "A", option: "ish" },
    });
    const res11 = httpMocks.createResponse();
    vote(req11, res11);
    assert.strictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getData().replaced, true);

    // 6th branch, straight line code, case 2
    const req12 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "kei", voterName: "B", option: "banana" },
    });
    const res12 = httpMocks.createResponse();
    vote(req12, res12);
    assert.strictEqual(res12._getStatusCode(), 200);
    assert.deepStrictEqual(res12._getData().replaced, true);
  });

  it("result", function () {
    // first branch, straight line code, only case
    const req1 = httpMocks.createRequest({
      method: "GET",
      url: "/api/result",
      query: {},
    });
    const res1 = httpMocks.createResponse();
    getResult(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'missing "name" parameter');

    // second branch, straight line code, case 1
    const req2 = httpMocks.createRequest({
      method: "GET",
      url: "/api/result",
      query: { name: "da" },
    });
    const res2 = httpMocks.createResponse();
    getResult(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(
      res2._getData(),
      `poll does not exist with name: ${req2.query.name}`
    );

    // second branch, straight line code, case 2
    const req3 = httpMocks.createRequest({
      method: "GET",
      url: "/api/result",
      query: { name: "a" },
    });
    const res3 = httpMocks.createResponse();
    getResult(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(
      res3._getData(),
      `poll does not exist with name: ${req3.query.name}`
    );

    // third branch, staight line code, case 1
    const map1: Map<string, number> = new Map();
    map1.set("lp", 0);
    map1.set("ish", 1);
    map1.set("total", 1);
    const req4 = httpMocks.createRequest({
      method: "GET",
      url: "/api/result",
      query: { name: "milo" },
    });
    const res4 = httpMocks.createResponse();
    getResult(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 200);
    const map0: Map<string, number> = new Map(
      Object.entries(res4._getData().result)
    );
    assert.strictEqual(map0.get("lp"), map1.get("lp"));
    assert.strictEqual(map0.get("ish"), map1.get("ish"));
    assert.strictEqual(map0.get("total"), map1.get("total"));
    // third branch, staight line code, case 2
    const req5 = httpMocks.createRequest({
      method: "POST",
      url: "/api/vote",
      body: { name: "milo", voterName: "B", option: "ish" },
    });
    const res5 = httpMocks.createResponse();
    vote(req5, res5);

    map1.set("lp", 0);
    map1.set("ish", 2);
    map1.set("total", 2);
    const req6 = httpMocks.createRequest({
      method: "GET",
      url: "/api/result",
      query: { name: "milo" },
    });
    const res6 = httpMocks.createResponse();
    getResult(req6, res6);
    assert.strictEqual(res6._getStatusCode(), 200);
    const map2: Map<string, number> = new Map(
      Object.entries(res6._getData().result)
    );
    assert.strictEqual(map2.get("lp"), map1.get("lp"));
    assert.strictEqual(map2.get("ish"), map1.get("ish"));
    assert.strictEqual(map2.get("total"), map1.get("total"));
  });
});
