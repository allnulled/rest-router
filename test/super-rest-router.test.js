const { expect, assert } = require("chai");
const async = require("async");
const request = require("request");
const http = require("http");
const rimraf = require("rimraf");
const input = {
  DATABASE: "newdb",
  USER: "root",
  PASSWORD: "toor"
};

describe("SuperRestRouter class", function() {
  before(() => rimraf.sync(__dirname + "/../models"));
  const { SuperRestRouter } = require(__dirname + "/../src/super-rest-router.js");
  const executeTest = (done, app, server, rest) => {
    async.series({
      "/city": function(callback) {
        request("http://127.0.0.1:3000/api/v1/city", function(request, response, body) {
          const data = JSON.parse(body);
          expect(data).to.deep.equal([{
            "id": 1,
            "name": "Oregon",
            "people": 500000
          }, {
            "id": 2,
            "name": "Atlanta",
            "people": 400000
          }, {
            "id": 3,
            "name": "Proma",
            "people": 200000
          }]);
          callback(null, data);
        });
      },
      "/country": function(callback) {
        request("http://127.0.0.1:3000/api/v1/country", function(request, response, body) {
          const data = JSON.parse(body);
          expect(data).to.deep.equal([]);
          callback(null, data);
        });
      },
      "/house": function(callback) {
        request("http://127.0.0.1:3000/api/v1/house", function(request, response, body) {
          const data = JSON.parse(body);
          expect(data).to.deep.equal([]);
          callback(null, data);
        });
      },
      "/user": function(callback) {
        request("http://127.0.0.1:3000/api/v1/user", function(request, response, body) {
          const data = JSON.parse(body);
          expect(data).to.deep.equal([]);
          callback(null, data);
        });
      },
      "/user_and_city": function(callback) {
        request("http://127.0.0.1:3000/api/v1/user_and_city", function(request, response, body) {
          const data = JSON.parse(body);
          expect(data).to.deep.equal([]);
          callback(null, data);
        });
      }
    }, function(error = null, data) {
      server.close();
      rest.auto.sequelize.close();
      done(error, data);
    });
  };

  it("is instantiable and exposes simple databases as REST HTTP API", function(done) {
    this.timeout(5000);
    const app = require("express")();
    const bodyParser = require("body-parser");
    const restRouter = new SuperRestRouter(input.DATABASE, input.USER, input.PASSWORD, {});
    const server = http.createServer(app);
    restRouter.createRouter().then(function(data) {
      app.use("/api/v1", data.router);
      server.listen(3000);
      executeTest(done, app, server, data.rest);
    });
  });

  it("can create routers with static 'create' method too and reuse already created express.Router(s)", function(done) {
    //
    this.timeout(5000);
    const app = require("express")();
    const router = require("express").Router();
    const bodyParser = require("body-parser");
    
    const server = http.createServer(app);
    SuperRestRouter
      .create(input.DATABASE, input.USER, input.PASSWORD, {}, router)
      .then((data) => {
        app.use("/api/v1", data.router);
        server.listen(3000);
        executeTest(done, app, server, data.rest);
      })
      .catch(console.error);
  });

  it("can create routers with static 'create' method too and create express.Router(s) on-the-fly", function(done) {
    //
    this.timeout(5000);
    const app = require("express")();
    const bodyParser = require("body-parser");
    const server = http.createServer(app);
    SuperRestRouter
      .create(input.DATABASE, input.USER, input.PASSWORD, {})
      .then((data) => {
        app.use("/api/v1", data.router);
        server.listen(3000);
        executeTest(done, app, server, data.rest);
      })
      .catch(console.error);
  });

  it("lets to handle errors, for example, when it is used with erroneous credentials", function(done) {
    //
    this.timeout(5000);
    const app = require("express")();
    const bodyParser = require("body-parser");
    const server = http.createServer(app);
    SuperRestRouter
      .create(input.DATABASE, input.USER, "xxx" + input.PASSWORD, {})
      .then((data) => {
        app.use("/api/v1", data.router);
        server.listen(3000);
        expect(true).to.equal(false);
      })
      .catch((error) => {
        expect(true).to.equal(true);
        done();
        server.close();
      });
  });

});