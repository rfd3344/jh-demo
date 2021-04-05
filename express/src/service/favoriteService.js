'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    FavoriteModel = require('../model/favoriteModel'),
	CourseModel = require('../model/courseModel'),
	StudentModel = require('../model/studentModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('favoriteErrLog');
	
// The favorite service.
var favoriteService = {};

// Create new favorite
favoriteService.add = function(req, res) {
	if(!req.body.course_id) {
		res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	} else {
		// check favorite id exist or not
		FavoriteModel.findOne({
			where: { 
				course_id: req.body.course_id,
				student_id: req.user.id
			}
		}).then(function(favorite) {
			if(favorite) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Favorite already Exists!' })
			} else {
				// check course id exists or not
				CourseModel.findOne({
					where: { id: req.body.course_id }
				}).then(function(course) {
					if(!course) {
						res.status(httpStatus.NOT_ALLOW).json({ message: 'Course not Found!' })
					} 
					else {
						// add favorite data into database
						db.sync().then(function() {
							var favorite_data = req.body
							favorite_data.student_id = req.user.id
							logger.debug(favorite_data)
							FavoriteModel.create(favorite_data).then(function() {
								res.status(httpStatus.CREATED).json({ message: 'New Favorite Added' })
							})
						})
					}
				})
			}
		}).catch(function(error) {
        	errLogger.error('Delete Favorite Info Error:\n' + error)
			res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
		})
	}
}


// Receive favorite info
/*
favoriteService.get = function(req, res) {
	FavoriteModel.findOne( {
		where: { id: req.params.id }
	}).then(function(favorite) {
		if(!favorite) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Favorite not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(favorite)
		}
	}).catch(function(error) {
        errLogger.error('Get Favorite Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}
*/
// Receive favorite info list
/*
favoriteService.getList = function(req, res) {
	if(!req.body.limit || !req.body.page || parseInt(req.body.limit) < 0 || parseInt(req.body.page) < 0){
		res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	} else {
		FavoriteModel.findAndCountAll({
			limit: parseInt(req.body.limit),
			offset: (parseInt(req.body.page) - 1) * parseInt(req.body.limit)
		}).then(function(favorite) {
			if(!favorite) {
				res.status(httpStatus.NOT_FOUND).json({ message: 'Favorite not Found!' })
			} else {
				res.status(httpStatus.OKAY).json(favorite)
			}
		}).catch(function(error) {
	        errLogger.error('Get Favorite Info Error:\n' + error)
			res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
		})
	}
}
*/

// Update favorite info
/*
favoriteService.update = function(req, res){
	if(!req.body.status){
		res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	} else {
		// check favorite id exist or not
		FavoriteModel.findOne({
			where: { id: req.params.id }
		}).then(function(favorite) {
			if(!favorite) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Favorite not Found!' })
			} else {
				// check course id exists or not
				CourseModel.findOne({
					where: { id: favorite.course_id }
				}).then(function(course) {
					if(!course) {
						res.status(httpStatus.NOT_ALLOW).json({ message: 'Course not Found!' })
					} 
					else {
						// check student id exists or not
						StudentModel.findOne({
							where: { id: favorite.student_id }
						}).then(function(student) {
							if(!student) {
								res.status(httpStatus.NOT_ALLOW).json({ message: 'Student not Found!' })
							} 
							else {
								// update favorite data
								var favorite_data = {}
								favorite_data.deposit = req.body.deposit
								favorite_data.note = req.body.note
								favorite_data.balance_due = course.fee - favorite_data.deposit
								favorite_data.status = req.body.status
								logger.debug(favorite_data)
								favorite.update(favorite_data).then(function(){
									res.status(httpStatus.OKAY).json({message: 'Favorite Data Updated'})
								})
							}
						})
					}
				})
			}
		})
	}
}
*/
// Delete favorite info
favoriteService.del = function(req, res) {
	FavoriteModel.findOne({
		where: { 
			course_id: req.body.course_id,
			student_id: req.user.id
		}
	}).then(function(favorite) {
		if(!favorite) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Favorite not Found!' })
		} else {
			// delete favorite data
			favorite.destroy().then(function(){
                res.status(httpStatus.OKAY).json({message: 'Favorite Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Favorite Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = favoriteService;