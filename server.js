#!/bin/env node
var express = require('express');
var fs = require('fs');

var un = 'node';//change this to something private
var pw = 'password';//change this to something private

//var blogPost = require('./db/blog');
var db = require('./db/db');
var publicService = require('./services/publicService');
var accessLevelService = require('./services/accessLevelService');
var languageService = require('./services/languageService');
var categoryService = require('./services/categoryService');
var sectionService = require('./services/sectionService');
var linksService = require('./services/linksService');
var locationService = require('./services/locationService');
var ulboraUserService = require('./services/ulboraUserService');
var articleService = require('./services/articleService');



var nodeBlog = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;


        if (typeof self.ipaddress === "undefined") {
            //  Log errors but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
        ;
    };




    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                    Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {

        self.app = express();        
        self.app.use(express.logger('dev'));
        self.app.use(express.bodyParser());
        self.app.use(express.static(__dirname + '/public'));
        var auth = express.basicAuth(un, pw);
        db.initializeMongoDb();
        

        self.app.post('/rs/public/login', publicService.login);
        self.app.post('/rs/accessLevel', accessLevelService.create);//just for test
        
        
        
        //language
        self.app.post('/rs/language', languageService.create);
        self.app.put('/rs/language', languageService.update);
        self.app.delete('/rs/language/:id', languageService.delete);
        self.app.get('/rs/language/:id', languageService.get);
        self.app.post('/rs/language/list', languageService.list);
        
        
        //category
        self.app.post('/rs/category', categoryService.create);
        self.app.put('/rs/category', categoryService.update);
        self.app.delete('/rs/category/:id', categoryService.delete);
        self.app.get('/rs/category/:id', categoryService.get);
        self.app.post('/rs/category/list', categoryService.list);
        
        
        //section
        self.app.post('/rs/section', sectionService.create);
        self.app.put('/rs/section', sectionService.update);
        self.app.delete('/rs/section/:id', sectionService.delete);
        self.app.get('/rs/section/:id', sectionService.get);
        self.app.post('/rs/section/list', sectionService.list);
        
        
        //links
        self.app.post('/rs/link', linksService.create);
        self.app.put('/rs/link', linksService.update);
        self.app.delete('/rs/link/:id', linksService.delete);
        self.app.get('/rs/link/:id', linksService.get);
        self.app.post('/rs/link/list', linksService.list);
        
        
        //location
        self.app.post('/rs/location', locationService.create);
        //self.app.put('/rs/location', locationService.update);
        self.app.delete('/rs/location/:id', locationService.delete);
        self.app.get('/rs/location/:id', locationService.get);
        self.app.post('/rs/location/list', locationService.list);
        
        //user
        self.app.post('/rs/user', ulboraUserService.create);
        self.app.put('/rs/user', ulboraUserService.update);
        self.app.delete('/rs/user/:id', ulboraUserService.delete);
        self.app.get('/rs/user/:id', ulboraUserService.get);
        self.app.post('/rs/user/list', ulboraUserService.list);
        self.app.post('/rs/user/pw', ulboraUserService.changePassword);
        self.app.post('/rs/user/roleList', ulboraUserService.roleList);
        
        //article
        self.app.post('/rs/article/values', articleService.values);
        



        self.app.get('/rs/test', auth, function(req, res) {
            //var w = test();
            res.send([{code: 2, name: "ken"}, {name: 'wine2'}]);
        });

        //self.app.post('/NodeBlog/blog', auth, blogPost.saveBlog);
        //self.app.post('/NodeBlog/comment', auth, blogPost.saveComment);
        //self.app.get('/NodeBlog/blogList', blogPost.findBlogList);
        //self.app.get('/NodeBlog/blog/:id', blogPost.findBlog);
        /*
        self.app.post('/UlboraCms/login', function(req, res) {
            var reqBody = req.body;
            var auth = false;
            if (!req.is('application/json')) {
                res.status(415);
            } else {
                if (reqBody.username === un && reqBody.password === pw) {
                    auth = true;
                }
            }
            var returnVal = {
                "authenticated": auth
            };
            res.send(returnVal);

        });
        */
        self.app.post('/rs/blogTest', function(req, res) {
            var reqBody = req.body;
            console.log("new Blog: " + JSON.stringify(reqBody));
            res.json(req.body);
        });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();        
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now()), self.ipaddress, self.port);
        });
    };



};



/**
 *  main():  Main code.
 */
var zapp = new nodeBlog();
zapp.initialize();
zapp.start();

