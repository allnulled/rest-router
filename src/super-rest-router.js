/**
 * 
 * # super-rest-router
 * 
 * 
 * SuperRestRouter can create HTTP REST APIs (for Express apps) from database credentials (using Sequelize ORM), and nothing else.
 * 
 * SuperRestRouter is a small tool to auto-generate REST APIs (for ExpressJS) automatically from databases (supported by Sequelize ORM).
 * 
 * ---
 * 
 * ## 1. Installation
 * 
 * ~$ `npm install --save super-rest-router`
 * 
 * ---
 * 
 * ## 2. Based on...
 * 
 * **SuperRestRouter** is based on:
 * 
 *   · [Sequelize ORM](https://github.com/sequelize/sequelize): a flexible ORM for Node.js.
 * 
 *   · [ExpressJS Web Framework](https://github.com/expressjs/express): the most widely used server application framework for Node.js.
 * 
 *   · [Sequelize Auto](https://github.com/sequelize/sequelize-auto): a tool to auto-generate Sequelize ORM models from a simple database connection.
 * 
 *   · [Epilogue](https://github.com/dchester/epilogue): a tool to generate REST endpoints from a Sequelize connection.
 * 
 * This is important to know if you want to have a full knowledge about how this tool works.
 * 
 * ---
 * 
 * ## 3. Usage
 * 
 * ### 3.1. Import `SuperRestRouter` class:
 * 
 * ```js
 * const SuperRestRouter = require("super-rest-router").SuperRestRouter;
 * ```
 * 
 * ### 3.2. Create a new `SuperRestRouter` instance, providing the credentials of your database:
 * 
 * ```js
 * const rest = new SuperRestRouter("database", "user", "password", { options: true });
 * ```
 * 
 * ### 3.3. Create a new `Router` (`express.Router`) and use the returned `Promise` to access it:
 * 
 * ```js
 * rest
 *   .createRouter()
 *   .then(function(data) {
 *     const { rest, router, resources } = data;
 *     myExpressApp.use("/my/personal/api/v1", router);
 *     myExpressApp.listen(8008, () => console.log("Server listening!"));
 *   })
 *   .catch(function(error) {
 *     console.error(error);
 *   });
 * ```
 * 
 * ### 3.4. Done.
 * 
 * Once you set your server/app listening, you can start fetching and updating data from your database, via HTTP.
 * 
 * ---
 * 
 * ## 4. API Reference
 * 
 */

const express = require("express");
const Router = express.Router;
const Sequelize = require("sequelize");
const SequelizeAuto = require("sequelize-auto-disconnectable");
const epilogue = require("epilogue");

/**
 * 
 * ---
 * 
 * ### **`SuperRestRouter = require("super-rest-router").SuperRestRouter`**
 * 
 * @type `{Class}`
 * @description Class that has the ability to create Express.Router(s)
 * that set up an HTTP REST API exposing the database we specify.
 * It supports any database supported by 
 * [Sequelize ORM](https://github.com/sequelize/sequelize).
 *  
 */
class SuperRestRouter {


  /**
   * 
   * ---
   * 
   * ### **`SuperRestRouter.create(String:database, String:user, String:password, Object:options, Object:app)`**
   * 
   * @type `{Function:Static class method}`
   * @parameter `{String} database`. Name of the database to be exposed as REST HTTP API.
   * @parameter `{String} user`. Name of the user that is going to connect.
   * @parameter `{String} password`. Password of the user that is going to connect.
   * @parameter `{Object} options`. Options passed to the SuperRestRouter generator. It corresponds to the [`Sequelize-Auto options`](https://github.com/sequelize/sequelize-auto).
   * @parameter `{Object:Express.Application} app`. ExpressJS application to which add the HTTP calls.
   * @return `{Object:Promise} promise`. The `Promise++ instance returned by `SuperRestRouter#createRouter()` method.
   * @description This method instantiates a new SuperRestRouter, and calls to its method 
   * `createRouter()`, returning the `Promise` that this method generates. We can, then, use the callbacks of
   * this `Promise` in order to use the generated `Express.Router`. So, in the end, one can use this method to
   * abbreviate: 
   * 
   * ```js
   * (new SuperRestRouter("db", "admin", "123456")).createRouter(expressApp);
   * ```
   * 
   * into:
   * 
   * ```js
   * SuperRestRouter.create("db", "admin", "123456", expressApp);
   * ```
   * 
   * Note: some parameters may be optional, depending on the original methods. This will be explained in these other methods.
   * 
   * 
   */
  static create(database, user, password, options, router = undefined) {
    return (new SuperRestRouter(database, user, password, options)).createRouter(router);
  }

  /**
   * 
   * ---
   * 
   * ### **`new SuperRestRouter(String:database, String:user, String:password, Object:options)`**
   * 
   * @type `{Function:Constructor}`
   * @parameter `{String} database`. Name of the database to be exposed as REST HTTP API.
   * @parameter `{String} user`. Name of the user that is going to connect.
   * @parameter `{String} password`. Password of the user that is going to connect.
   * @parameter `{Object} options`. **Optional**. Name of the database to be exposed as REST HTTP API.
   * @property `{String} this.database`
   * @property `{String} this.user`
   * @property `{String} this.password`
   * @property `{Object} this.options`
   * @property `{Object:SequelizeAuto} this.auto`
   * @property `{Object:express.Router} this.router`
   * @property `{Array<Sequelize.Model>} this.resources`
   * @return `{Object:SuperRestRouter}`
   * @description Constructor for the `SuperRestRouter` class.
   * 
   * 
   */
  constructor(database, user, password, options) {
    this.database = database;
    this.user = user;
    this.password = password;
    this.options = Object.assign({}, {
      dialect: "mysql",
      //logging: console.log,
      logging: false,
      define: {
        timestamps: false,
        freezeTableName: true
      },
      closeConnectionAutomatically: false,
      directory: "models"
    }, options);
  }

  /**
   * 
   * ---
   * 
   * ### **`SuperRestRouter#createRouter(Object:routerOrApp)`**
   * 
   * @type `{Function:Method}`
   * @parameter `{Object:Express.Router || Object:Express.Application} routerOrApp`. **Optional**. Application
   * or Router to which add the generated endpoints.
   * @return `{Object:Promise}`. This method returns a `Promise` instance. This means that one can:
   * 
   * ```js
   * myRestRouter.createRouter()
   *   .then(function(data) {
   *     const { rest, router, resources } = data;
   *     // Here, you can use the generated stuff...
   *   })
   *   .catch(function(error) {
   *     // You can handle errors here too...
   *   });
   * ```
   * 
   * The `Promise` instance receives an object holding:
   *   
   *   · The instance of the SuperRestRouter.
   * 
   *   · The instance of the Express.Router.
   * 
   *   · The resources (Sequelize models) that have been generated.
   * 
   * 
   * @description This method will add all the generated endpoints to an `express.Router` (created or provided)
   * and the returned `Promise` will give the developer access to the intermediate data.
   * As the Sequelize models are retrieved in an asynchronous process, this has to be done through
   * asynchronous coding: that is why a `Promise` is returned with all the things needed. 
   * Once inside the `Promise` resolution, you can add the `express.Router` to your `express.Application` in
   * the normal way: `myApp.use(endpoint, router)`. Once this is done, your application will have all the necessary
   * endpoints to transform your Sequelize models into a beautiful and handy HTTP REST API.
   * 
   * 
   * 
   */
  createRouter(router = undefined) {
    const restRouter = this;
    return new Promise(function(resolve, reject) {
      try {
        restRouter.auto = new SequelizeAuto(restRouter.database, restRouter.user, restRouter.password, restRouter.options);
      } catch (err) {
        return reject(err);
      }
      restRouter.router = router ? router : new Router();
      restRouter.resources = [];
      restRouter.auto.run(function(error) {
        if (error) return reject(error);
        // @TODO: add routes to the Router:
        epilogue.initialize({
          app: restRouter.router,
          sequelize: restRouter.auto.sequelize
        });
        Object.keys(restRouter.auto.tables).forEach(name => {
          const table = restRouter.auto.tables[name];
          restRouter.auto.sequelize.define(name, table);
          const model = restRouter.auto.sequelize.models[name];
          const endpoints = [`/${name}`, `/${name}/:id`];
          const resource = epilogue.resource({
            model: model,
            endpoints: endpoints
          });
          restRouter.resources.push(resource);
        });
        return resolve({
          rest: restRouter,
          router: restRouter.router,
          resources: restRouter.resources
        });
      });
    });
  }

}

module.exports = { SuperRestRouter };

/**
 * 
 * ---
 * 
 * ## 5. Conclusion
 * 
 * SuperRestRouter is a simple tool, composed with a few lines of code, but it can take so much time of your development, that... well, you should better not use it.
 * 
 * Better for me, of course. Go fuck yourself, bastards.
 * 
 * Pray to Microsoft and Google. They could have done this shit decades before. But nope, it is more secure to let the human do the mechanical part.
 * 
 * Fuck you all. You are all INSANE.
 * 
 * And this is why: university has to be paid because you are not enough clever to understand how
 * cheap and easy it would be to record all the classes once for a year, and upload the videos to Youtube.
 * How cheap and easy it would be to pay once for the official books, and share them the rest of the times they are used.
 * 
 * But you think that your society is normal.
 * 
 * You are so stupid that your government is selling weapons to the terrorists, and you think it is normal.
 * 
 * Yeah. So normal. So normal for an abnormal society like the yours.
 * 
 * Please, listen. NaturalScript was not a joke, despite they (big companies) laught a lot at me.
 * 
 * It was the starting point of a new civilization, a new one that is respectful with LOGIC.
 * 
 * But this is not your case. 
 * 
 * You are respectful with your own apetences. U LIKE IT? Cool! Cause that is the most important of the universe: that you liked it. Is it?
 * 
 * 
 */