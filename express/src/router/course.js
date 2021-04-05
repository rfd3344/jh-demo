'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    courseService = require('../service/courseService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var CourseRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, courseService.add))
    router.get('/list', courseService.getList)
    router.get('/detail/:id', courseService.getDetail)
    router.get('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, courseService.get))
	router.post('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, courseService.update))
    router.post('/delete/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, courseService.del))
	
    return router;
};

module.exports = CourseRouter;