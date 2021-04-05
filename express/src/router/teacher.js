'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    teacherService = require('../service/teacherService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var TeacherRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, teacherService.add))
	router.get('/list', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, teacherService.getList))
	router.get('/:id', teacherService.get)
	router.post('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, teacherService.update))
    router.post('/delete/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, teacherService.del))
	
    return router;
};

module.exports = TeacherRouter;