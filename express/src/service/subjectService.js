'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    SubjectModel = require('../model/subjectModel'),
	TeacherModel = require('../model/teacherModel'),
	EnrolmentModel = require('../model/enrolmentModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('subjectErrLog');

// The subject service.
var subjectService = {};

// Create new subject
subjectService.add = function(req, res) {
	if(!req.body.english_name || !req.body.chinese_name) {
    	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
    } else {
		// add subject data into database
		db.sync().then(function() {
			var subject_data = req.body
			logger.debug(subject_data)
			SubjectModel.create(subject_data).then(function() {
				res.status(httpStatus.CREATED).json({ message: 'New Subject Added!' })
			})
		})
	}
}

// Receive subject info
/*
subjectService.get = function(req, res) {
	SubjectModel.findOne( {
		where: { id: req.params.id }
	}).then(function(subject) {
		if(!subject) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Subject not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(subject)
		}
	}).catch(function(error) {
        errLogger.error('Get Subject Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}
*/

// Receive subject info list
subjectService.getList = function(req, res) {
	var condition = {}
	if (req.query.limit && req.query.page) {
		if(parseInt(req.query.limit) < 0 || parseInt(req.query.page) < 0){
			res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
		} else {
			condition = {
				limit: parseInt(req.query.limit),
				offset: (parseInt(req.query.page) - 1) * parseInt(req.query.limit)
			}
		}
	}  
	SubjectModel.findAndCountAll(condition).then(function(subjects) {
		if(!subjects) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Subject not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(subjects)
		}
	}).catch(function(error) {
        errLogger.error('Get Subject Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Update subject info
subjectService.update = function(req, res){ 
	if(!req.body.english_name || !req.body.chinese_name) {
    	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
    } else {
		// check in subject table, if code exist or not
		SubjectModel.findOne({
			where: { id: req.params.id }
		}).then(function(subject) {
			if(!subject) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Subject not Found!' })
			} else {
				// update subject data
				var subject_data = req.body
				subject.update(subject_data).then(function(){
					res.status(httpStatus.OKAY).json({message: 'Subject Data Updated'})
				})
			}
		})
	}
}

// Delete subject info
subjectService.del = function(req, res) {
	SubjectModel.findOne({
		where: { id: req.params.id }
	}).then(function(subject) {
		if(!subject) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Subject not Found!' })
		} else {
			// delete subject data
			subject.destroy().then(function(){
                res.status(httpStatus.OKAY).json({message: 'Subject Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Subject Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = subjectService;