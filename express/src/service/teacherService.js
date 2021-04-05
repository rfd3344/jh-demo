'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    TeacherModel = require('../model/teacherModel'),
    InstitutionModel = require('../model/institutionModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('teacherErrLog');

// Add storage
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, "./public/teacher")
  },
  filename: function(req, file, callback){
    callback(null, "teacher" + '-' + Date.now() + ".jpg")
  }
})

var upload = multer({
  storage: storage
}).single('photo')

// The teacher service.
var teacherService = {};

// Create new teacher
teacherService.add = function(req, res) {
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.name || !req.body.title || !req.body.description) {
			if(req.file){
				fs.unlink("./public/teacher/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
        	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	    } else {
	    	// check institution id exists or not
			InstitutionModel.findOne({
				where: { id: req.user.institution_id }
			}).then(function(institution) {
				if(!institution) {
					if(req.file){
						fs.unlink("./public/course/"+ req.file.filename, function(err){
							if (err) {
								console.log("Failed to delete local image:" + err)
							}						
						})
					}
					res.status(httpStatus.NOT_ALLOW).json({ message: 'Institution not Found!' })
				} 
				else {
					// check in teacher table, if code exist or not
					TeacherModel.findOne({
						where: { 
							name: req.body.name,
						}
					}).then(function(teacher) {
						if(teacher) {
							if(req.file){
								fs.unlink("./public/teacher/"+ req.file.filename, function(err){
									if (err) {
										console.log("Failed to delete local image:" + err)
									}						
								})
							}
							res.status(httpStatus.NOT_ALLOW).json({ message: 'Teacher Already Exists!' })
						} else {
							// add teacher data into database
							db.sync().then(function() {
								var teacher_data = req.body
                                teacher_data.institution_id = req.user.institution_id
								if(req.file){
									teacher_data.photo_path = '/teacher/'+req.file.filename
								}
								logger.debug(teacher_data)
								TeacherModel.create(teacher_data).then(function() {
									res.status(httpStatus.CREATED).json({ message: 'New Teacher Added!' })
								})
							})
						}
					})
				}
			})
		}
	})
}

// Receive teacher info
teacherService.get = function(req, res) {
	TeacherModel.findOne( {
		where: { id: req.params.id }
	}).then(function(teacher) {
		if(!teacher) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Teacher not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(teacher)
		}
	}).catch(function(error) {
        errLogger.error('Get Teacher Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive teacher info list
teacherService.getList = function(req, res) {
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
	TeacherModel.findAndCountAll(condition).then(function(teacher) {
		if(!teacher) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Teacher not Found!' })
		} else {
            var result = {}
            result.count = teacher.count
            result.rows = []
            teacher.rows.forEach(function(element) {
                var row = {}
                row.id = element.id
                row.name = element.name
                row.title = element.title
                row.description = element.description
                row.photo_path = element.photo_path
                row.createdAt = element.createdAt
                row.updatedAt = element.updatedAt
                result.rows.push(row)
            });
			res.status(httpStatus.OKAY).json(result)
		}
	}).catch(function(error) {
        errLogger.error('Get Teacher Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Update teacher info
teacherService.update = function(req, res){
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		else {
			if(!req.body.name || !req.body.title || !req.body.description) {
				if(req.file){
					fs.unlink("./public/teacher/"+ req.file.filename, function(err){
						if (err) {
							console.log("Failed to delete local image:" + err)
						}						
					})
				}
	        	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
		    } else {
				// check in teacher table, if code exist or not
				TeacherModel.findOne({
					where: { id: req.params.id }
				}).then(function(teacher) {
					if(!teacher) {
						if(req.file){
							fs.unlink("./public/teacher/"+ req.file.filename, function(err){
								if (err) {
									console.log("Failed to delete local image:" + err)
								}						
							})
						}
						res.status(httpStatus.NOT_ALLOW).json({ message: 'Teacher not Found!' })
					} else {
						// update teacher data
						var teacher_data = req.body
						if(req.file){
							fs.unlink("./public" + teacher.photo_path, function(err){
								if (err) {
									console.log("Failed to delete local image:" + err)
								}						
							})
							teacher_data.photo_path = '/teacher/'+req.file.filename
						}
						teacher.update(teacher_data).then(function(){
							res.status(httpStatus.OKAY).json({message: 'Teacher Data Updated'})
						})
					}
				})
			}
		}
	})
}

// Delete teacher info
teacherService.del = function(req, res) {
	TeacherModel.findOne({
		where: { id: req.params.id }
	}).then(function(teacher) {
		if(!teacher) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Teacher not Found!' })
		} else {
			// delete teacher data
			teacher.destroy().then(function(){
				// delete teacher image
				fs.unlink("./public" + teacher.photo_path, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
                res.status(httpStatus.OKAY).json({message: 'Teacher Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Teacher Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = teacherService;