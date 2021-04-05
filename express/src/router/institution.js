'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    institutionService = require('../service/institutionService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var InstitutionRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, institutionService.add))
	router.get('/list', institutionService.getList)
	router.get('/:id', institutionService.get)
	router.post('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, institutionService.update))
    router.post('/delete/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.admin, institutionService.del))
	
    return router;
};

module.exports = InstitutionRouter;