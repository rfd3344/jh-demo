'use strict';

var router = require('express').Router();

var config = require('../config').get(process.env.NODE_ENV),
    userService = require('../service/userService'),
    allowOnly = require('../common/routesHelper').allowOnly

var UserRouter = function(passport) {
    router.post('/signup', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, userService.signUp))

    router.post('/login', userService.logIn)
	  router.get('/logout', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user, userService.logOut))

    router.get('/list', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, userService.getList))
    router.get('/info', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user,userService.getInfo))
    router.post('/info', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user,userService.updateInfo))

    router.post('/pwd', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.user,userService.updatePwd))

    router.post('/delete', passport.authenticate('jwt', { session: false }), allowOnly(config.accessLevels.super_user, userService.del))

    return router
};

module.exports = UserRouter;
