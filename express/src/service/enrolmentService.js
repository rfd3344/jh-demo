'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    EnrolmentModel = require('../model/enrolmentModel'),
	CourseModel = require('../model/courseModel'),
	StudentModel = require('../model/studentModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('enrolmentErrLog');
	
// The enrolment service.
var enrolmentService = {};

// Create new enrolment
enrolmentService.add = function(req, res) {
	if(!req.body.course_id || !req.body.status) {
		res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	} else {
		// check enrolment id exist or not
		EnrolmentModel.findOne({
			where: { 
				course_id: req.body.course_id,
				student_id: req.user.id
			}
		}).then(function(enrolment) {
			if(enrolment) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Enrolment already Exists!' })
			} else {
				// check course id exists or not
				CourseModel.findOne({
					where: { id: req.body.course_id }
				}).then(function(course) {
					if(!course) {
						res.status(httpStatus.NOT_ALLOW).json({ message: 'Course not Found!' })
					} 
					else {
						// add enrolment data into database
						db.sync().then(function() {
							var enrolment_data = req.body
							enrolment_data.student_id = req.user.id
							enrolment_data.deposit = course.deposit
							enrolment_data.balance_due = course.fee - enrolment_data.deposit
							logger.debug(enrolment_data)
							EnrolmentModel.create(enrolment_data).then(function() {
								course.update({count_of_enrol: course.count_of_enrol + 1}).then(function(){
									res.status(httpStatus.CREATED).json({ message: 'New Enrolment Added' })
								})
							})
						})
					}
				})
			}
		})
	}
}


// Receive enrolment info
enrolmentService.get = function(req, res) {
	EnrolmentModel.findOne( {
		where: { id: req.params.id }
	}).then(function(enrolment) {
		if(!enrolment) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Enrolment not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(enrolment)
		}
	}).catch(function(error) {
        errLogger.error('Get Enrolment Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive enrolment info list
/*
enrolmentService.getList = function(req, res) {
	if(!req.body.limit || !req.body.page || parseInt(req.body.limit) < 0 || parseInt(req.body.page) < 0){
		res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	} else {
		EnrolmentModel.findAndCountAll({
			limit: parseInt(req.body.limit),
			offset: (parseInt(req.body.page) - 1) * parseInt(req.body.limit)
		}).then(function(enrolment) {
			if(!enrolment) {
				res.status(httpStatus.NOT_FOUND).json({ message: 'Enrolment not Found!' })
			} else {
				res.status(httpStatus.OKAY).json(enrolment)
			}
		}).catch(function(error) {
	        errLogger.error('Get Enrolment Info Error:\n' + error)
			res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
		})
	}
}
*/

// Update enrolment info
enrolmentService.update = function(req, res){
	if(!req.body.status){
		res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	} else {
		// check enrolment id exist or not
		EnrolmentModel.findOne({
			where: { id: req.params.id }
		}).then(function(enrolment) {
			if(!enrolment) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Enrolment not Found!' })
			} else {
				// check course id exists or not
				CourseModel.findOne({
					where: { id: enrolment.course_id }
				}).then(function(course) {
					if(!course) {
						res.status(httpStatus.NOT_ALLOW).json({ message: 'Course not Found!' })
					} 
					else {
						// check student id exists or not
						StudentModel.findOne({
							where: { id: enrolment.student_id }
						}).then(function(student) {
							if(!student) {
								res.status(httpStatus.NOT_ALLOW).json({ message: 'Student not Found!' })
							} 
							else {
								// update enrolment data
								var enrolment_data = {}
								enrolment_data.deposit = req.body.deposit
								enrolment_data.note = req.body.note
								enrolment_data.balance_due = course.fee - enrolment_data.deposit
								enrolment_data.status = req.body.status
								logger.debug(enrolment_data)
								enrolment.update(enrolment_data).then(function(){
									res.status(httpStatus.OKAY).json({message: 'Enrolment Data Updated'})
								})
							}
						})
					}
				})
			}
		})
	}
}

// Delete enrolment info
/*
enrolmentService.del = function(req, res) {
	EnrolmentModel.findOne({
		where: { id: req.params.id }
	}).then(function(enrolment) {
		if(!enrolment) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Enrolment not Found!' })
		} else {
			// delete enrolment data
			enrolment.destroy().then(function(){
                res.status(httpStatus.OKAY).json({message: 'Enrolment Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Enrolment Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}
*/
module.exports = enrolmentService;