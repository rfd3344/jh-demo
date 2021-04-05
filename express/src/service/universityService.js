'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    UniversityModel = require('../model/universityModel'),
	TeacherModel = require('../model/teacherModel'),
	EnrolmentModel = require('../model/enrolmentModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('universityErrLog');

// Add storage
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, "./public/university")
  },
  filename: function(req, file, callback){
    callback(null, "university" + '-' + Date.now() + ".jpg")
  }
})

var upload = multer({
  storage: storage
}).single('uni_image')

// The university service.
var universityService = {};

// Create new university
universityService.add = function(req, res) {
	upload(req, res, function(err){
		logger.debug(req.file)
		logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.english_name || !req.body.chinese_name) {
			if(req.file){
				fs.unlink("./public/university/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
        	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	    } else {
			// add university data into database
			db.sync().then(function() {
				var university_data = req.body
				if(req.file){
					university_data.uni_image_path = '/university/'+req.file.filename
				}
				logger.debug(university_data)
				UniversityModel.create(university_data).then(function() {
					res.status(httpStatus.CREATED).json({ message: 'New University Added!' })
				})
			})
		}
	})
}

// Receive university info
/*
universityService.get = function(req, res) {
	UniversityModel.findOne( {
		where: { id: req.params.id }
	}).then(function(university) {
		if(!university) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'University not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(university)
		}
	}).catch(function(error) {
        errLogger.error('Get University Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}
*/

// Receive university info list
universityService.getList = function(req, res) {
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
	UniversityModel.findAndCountAll(condition).then(function(universitys) {
		if(!universitys) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'University not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(universitys)
		}
	}).catch(function(error) {
        errLogger.error('Get University Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Update university info
universityService.update = function(req, res){
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.english_name || !req.body.chinese_name) {
			if(req.file){
				fs.unlink("./public/university/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
        	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	    } else {
			// check in university table, if code exist or not
			UniversityModel.findOne({
				where: { id: req.params.id }
			}).then(function(university) {
				if(!university) {
					if(req.file){
						fs.unlink("./public/university/"+ req.file.filename, function(err){
							if (err) {
								console.log("Failed to delete local image:" + err)
							}						
						})
					}
					res.status(httpStatus.NOT_ALLOW).json({ message: 'University not Found!' })
				} else {
					// update university data
					var university_data = req.body
					if(req.file){
						fs.unlink("./public" + university.uni_image_path, function(err){
							if (err) {
								console.log("Failed to delete local image:" + err)
							}						
						})
						university_data.uni_image_path = '/university/'+req.file.filename
					}
					university.update(university_data).then(function(){
						res.status(httpStatus.OKAY).json({message: 'University Data Updated'})
					})
				}
			})
		}
	})
}

// Delete university info
universityService.del = function(req, res) {
	UniversityModel.findOne({
		where: { id: req.params.id }
	}).then(function(university) {
		if(!university) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'University not Found!' })
		} else {
			// delete university data
			university.destroy().then(function(){
				// delete university image
				fs.unlink("./public" + university.uni_image_path, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
                res.status(httpStatus.OKAY).json({message: 'University Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete University Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = universityService;