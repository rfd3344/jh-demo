'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    studentService = require('../service/studentService'),
    allowOnly = require('../common/routesHelper').allowOnly

var studentRouter = function(passport) {
	// For students
	router.post('/signup', studentService.signUp)
	
	router.post('/login', studentService.logIn)

	router.get('/info', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, studentService.getInfo))
    router.post('/info', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, studentService.updateInfo))
	router.get('/courses', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, studentService.getCourses))
	router.get('/favorites', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, studentService.getFavorites))

	router.post('/pwd', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, studentService.updatePwd))
    router.post('/delete', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, studentService.del))
	
	// For institution
	router.get('/list', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, studentService.getList))
	router.get('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, studentService.get))
	
    return router;
};

module.exports = studentRouter;