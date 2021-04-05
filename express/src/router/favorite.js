'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    favoriteService = require('../service/favoriteService'),
    allowOnly = require('../common/routesHelper').allowOnly;

var FavoriteRouter = function(passport) {
	
    router.post('', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, favoriteService.add))
	//router.get('/:id', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, favoriteService.get))
	//router.post('/list', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, favoriteService.getList))
    router.post('/delete', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.student_only, favoriteService.del))
    return router;
};

module.exports = FavoriteRouter;