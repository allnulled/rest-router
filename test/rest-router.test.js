const { expect, assert } = require("chai");
const async = require("async");
const request = require("request");
const http = require("http");
const input = {};
input.DATABASE = "newdb";
input.USER = "root";
input.PASSWORD = "toor";

describe("RESTRouter class", function() {

  it("is instantiable and exposes simple databases as REST HTTP API", function(done) {
  	this.timeout(5000);
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

    const app = require("express")();
    const bodyParser = require("body-parser");
    const { RESTRouter } = require(__dirname + "/../src/rest-router.js");
    const restRouter = new RESTRouter(input.DATABASE, input.USER, input.PASSWORD, {});
    const server = http.createServer(app);
    restRouter.createRouter().then(function(data) {
      app.use("/api/v1", data.router);
      server.listen(3000);
      executeTest(done, app, server, data.rest);
    });

  });

});