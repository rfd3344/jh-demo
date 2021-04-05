'use strict';

var jwt = require('jsonwebtoken');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    UserModel = require('../model/userModel'),
    InstitutionModel = require('../model/institutionModel'),
	httpStatus = require('../common/httpStatus'),
	logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('userErrLog'),
    validator = require("email-validator");

// The user service.
var userService = {};

// User SignUp
userService.signUp = function(req, res) {
    if(!req.body.username ||!req.body.email || !validator.validate(req.body.email) || !req.body.password || !req.body.role_id) {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Please provide all the user data.'})
    } 
    else {
		// check institution id exists or not
		InstitutionModel.findOne({
			where: { id: req.user.institution_id }
		}).then(function(institution) {
			if(!institution) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Institution not Found!' })
			} 
			else {
                // check student exists or not
                UserModel.findOne({
                    where: { 
                        email: req.body.email
                    }
                }).then(function(user) {
                    if(user) {
                        res.status(httpStatus.NOT_ALLOW).json({ message: 'Username or Email Already Exists!' })
                    } 
                    else {
        				// create a user account in the database
        				db.sync().then(function() {
        					var newUser = req.body
        					logger.debug(newUser)
        					return UserModel.create(newUser).then(function() {
        						res.status(httpStatus.CREATED).json({ message: 'Account created!' })
        					})
        				}).catch(function(error) {
        					errLogger.error('User SignUp Error:\n' + error)
        					res.status(httpStatus.NOT_ALLOW).json({ message: 'Server Internal Error!' })
        				})
                    }
                })
			}
		})
    }
}

// User Login
userService.logIn = function(req, res) {
    if(!req.body.email || !req.body.password) {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Email and password are needed!' })
    } else {
		// find potential user
        var potentialUser = { 
            where: {
                email: req.body.email
            } 
        }
        UserModel.findOne(potentialUser).then(function(user) {
            if(!user) {
                res.status(httpStatus.NOT_FOUND).json({ message: 'User not Found!' })
            } else {
                // check password
                user.comparePasswords(req.body.password, function(error, isMatch) {
                    if(isMatch && !error) {
                        // update is_login field
                        logger.debug(user)
                        
                        user.update({
                            is_login: true
                        }).then(function(){
                            // generate login token 
                            var token = jwt.sign(
                                { 
                                    email: user.email,
                                    is_user: true
                                },
                                config.keys.secret,
                                { expiresIn: '24h' }
                            )
                            logger.debug(token)
           
                            // reply login token
                            res.status(httpStatus.OKAY).json({
                                token: 'JWT ' + token
                            })
                        })       
                     
                    } else {
                        res.status(httpStatus.NOT_ALLOW).json({ message: 'Invalid Username or Password!' })
                    }
                })
            }
        }).catch(function(error) {
            errLogger.error('User Login Error:\n' + error)
            res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
        })
    }
}

// User Logout
userService.logOut = function(req, res){
    //logger.debug(req.user)
    // update is_login field
    req.user.update({
        is_login: false
    }).then(function(){
        delete req.user
        return res.status(httpStatus.OKAY).json({message: 'Logout Successfully'})
    }).catch(function(error) {
        errLogger.error('User Logout Error:\n' + error)
        res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
    })                     
}

// Get User Info
userService.getInfo = function(req, res) {
    //logger.debug(req.user)
    if(req.user){
        // check institution id exists or not
        InstitutionModel.findOne({
            where: { id: req.user.institution_id }
        }).then(function(institution) {
            if(!institution) {
                res.status(httpStatus.NOT_ALLOW).json({ message: 'Institution not Found!' })
            } 
            else {
                // reply user info without password
                return res.status(httpStatus.OKAY).json({
                    id: req.user.id,
                    username: req.user.username,
                    email: req.user.email,
                    role_id: req.user.role_id,
                    institution_id: req.user.institution_id,
                    main_color: institution.main_color,
                    logo_path: institution.logo_path,
                    createdAt: req.user.createdAt
                })
            }
        })
    } else {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not Found!' })
    }
}

// Receive user info list
userService.getList = function(req, res) {
    var condition = {
        where: {
            institution_id: parseInt(req.user.institution_id)
        }
    }
    if (req.query.limit && req.query.page) {
        if(parseInt(req.query.limit) < 0 || parseInt(req.query.page) < 0){
            res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
        } else {
            condition = {
                where: {
                    institution_id: parseInt(req.user.institution_id)
                },
                limit: parseInt(req.query.limit),
                offset: (parseInt(req.query.page) - 1) * parseInt(req.query.limit)
            }
        }
    } 
    UserModel.findAndCountAll(condition).then(function(user) {
        if(!user) {
            res.status(httpStatus.NOT_FOUND).json({ message: 'User not Found!' })
        } else {
            var result = {}
            result.count = user.count
            result.rows = []
            user.rows.forEach(function(element) {
                var row = {}
                row.id = element.id
                row.username = element.username
                row.email = element.email
                row.role_id = element.role_id
                row.createdAt = element.createdAt
                row.updatedAt = element.updatedAt
                result.rows.push(row)
            });
            res.status(httpStatus.OKAY).json(result)
        }
    }).catch(function(error) {
        errLogger.error('Get User Info Error:\n' + error)
        res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
    })
}

// User Update Info
userService.updateInfo = function(req, res) {
    if(!req.body.username && !req.body.role_id) {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Please provide new user data.'})
    } 
    else {
        if(!req.body.username){
            req.body.username = req.user.username
        }
        // update password
        logger.debug(req.user)
        req.user.update({
            username: req.body.username,
        }).then(function(){
            res.status(httpStatus.OKAY).json({message: 'User Info Updated'})
        }).catch(function(error) {
            errLogger.error('User Update Info Error:\n' + error)
            res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
        })
    }
}

// User Update Password
userService.updatePwd = function(req, res) {
    if(!req.body.old_password || !req.body.new_password) {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Please provide the old password and a new password.'})
    } 
    else {
        // check password
        req.user.comparePasswords(req.body.old_password, function(error, isMatch) {
            if(isMatch && !error) {
                // update password
                logger.debug(req.user)
                req.user.update({
                    password: req.body.new_password
                }).then(function(){
                    res.status(httpStatus.OKAY).json({message: 'User Password Updated'})
                }).catch(function(error) {
                    errLogger.error('User Update Password Error:\n' + error)
                    res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
                })
            } else {
                res.status(httpStatus.NOT_ALLOW).json({ message: 'Invalid old password provided!' })
            }
        })
    }
}

// Delete user info
userService.del = function(req, res) {
    // obtain the specific user
    UserModel.findOne({
        where: { id: req.user.id }
    }).then(function(user) {
        if(!user) {
            res.status(httpStatus.NOT_FOUND).json({ message: 'User not Found!' })
        } else {
            // delete user data
            user.destroy().then(function(){
                res.status(httpStatus.OKAY).json({message: 'User Info Deleted!'})
            })
        }
    }).catch(function(error) {
        logger.error('User Delete Error:\n' + error)
        res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
    })
}

module.exports = userService;