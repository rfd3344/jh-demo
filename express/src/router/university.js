'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    universityService = require('../service/universityService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var UniversityRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, universityService.add))
	router.get('/list', universityService.getList)
	//router.get('/:id', universityService.get)
	router.post('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, universityService.update))
    router.post('/delete/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, universityService.del))
	
    return router;
};

module.exports = UniversityRouter;