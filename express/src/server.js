'use strict';

// NPM dependencies.
// const express = require('express');
// const bodyParser = require('body-parser');
// const sequelize = require('sequelize');
// const passport = require('passport');
// const jwt = require('jsonwebtoken');
// const path = require('path');
// const config = require('./app/config').get(process.env.NODE_ENV);
// const log4js = require('log4js');
// const db = require('./app/db');

var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('hello world')
});

app.get('/aaa', function (req, res) {
  res.send('hello world111')
});

app.listen(3000);


//
// // App related modules.
// var hookJWTStrategy = require('./app/common/passportStrategy');
// var info = require('./app/common/info');
// var logger = require('./app/common/logger').getLogger();
// var httpStatus = require('./app/common/httpStatus');
//
// // Connect database
// db.connect();
//
// // Initialise app.
// var app = express();
//
// // Parse as url encoded and json.
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
//
// // Hook up the HTTP logger.
// app.use(log4js.connectLogger(logger, {level:'auto', format: ':method :url :status'}));
//
// // Hook up Passport.
// app.use(passport.initialize());
//
// // Hook the passport JWT strategy.
// hookJWTStrategy(passport);
//
// // Set the static files location
// app.use(express.static(path.join(__dirname+ '/public')));
// //app.use(multipartMiddleware)
//
// // Enable cross-origin resource sharing (COR)
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "PUT,GET,POST,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, cache-control, Content-Type, Accept, Authorization");
//   next();
// });
//
// // Bundle API routes.
// app.use('/user', require('./app/router/user')(passport));
// app.use('/course', require('./app/router/course')(passport));
// app.use('/institution', require('./app/router/institution')(passport));
// app.use('/university', require('./app/router/university')(passport));
// app.use('/subject', require('./app/router/subject')(passport));
// app.use('/student', require('./app/router/student')(passport));
// app.use('/teacher', require('./app/router/teacher')(passport));
// app.use('/enrolment', require('./app/router/enrolment')(passport));
// app.use('/favorite', require('./app/router/favorite')(passport));
//
// app.get('/about', function(req, res) {
//     res.send({
//       name: info.getAppName(),
//       version: info.getAppVersion(),
//       author: info.getAppVendor(),
//       description: info.getAppDescription(),
//     });
// });
//
// // Catch all route.
// app.all('*', function(req, res) {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'Bad Request' });
// });
//
// app.all('*', function(req, res) {
// 	if(req.method == "OPTIONS"){
// 		res.status(httpStatus.OKAY);
// 	}
// })
//
// // Print logo header
// info.printHeaderAndLogo();
//
// // Start the server.
// var server = app.listen(config.port, function() {
//     logger.info('Server is listening http://localhost:'+config.port);
// });
