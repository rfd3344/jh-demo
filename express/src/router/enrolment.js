'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    enrolmentService = require('../service/enrolmentService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var EnrolmentRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, enrolmentService.add))
	router.get('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, enrolmentService.get))
	//router.post('/list', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, enrolmentService.getList))
	router.post('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, enrolmentService.update))
    //router.post('/delete/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, enrolmentService.del))
	
    return router;
};

module.exports = EnrolmentRouter;