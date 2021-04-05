'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    subjectService = require('../service/subjectService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var SubjectRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, subjectService.add))
	router.get('/list', subjectService.getList)
	//router.get('/:id', subjectService.get)
	router.post('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, subjectService.update))
    router.post('/delete/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, subjectService.del))
	
    return router;
};

module.exports = SubjectRouter;