'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    InstitutionModel = require('../model/institutionModel'),
	TeacherModel = require('../model/teacherModel'),
	EnrolmentModel = require('../model/enrolmentModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('institutionErrLog');

// Add storage
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, "./public/institution")
  },
  filename: function(req, file, callback){
    callback(null, "institution" + '-' + Date.now() + ".jpg")
  }
})

var upload = multer({
  storage: storage
}).single('logo')

// The institution service.
var institutionService = {};

// Create new institution
institutionService.add = function(req, res) {
	upload(req, res, function(err){
		logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.name || !req.body.main_color) {
			if(req.file){
				fs.unlink("./public/institution/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
        	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	    } else {
			// add institution data into database
			db.sync().then(function() {
				var institution_data = req.body
				if(req.file){
					institution_data.logo_path = '/institution/'+req.file.filename
				}
				logger.debug(institution_data)
				InstitutionModel.create(institution_data).then(function() {
					res.status(httpStatus.CREATED).json({ message: 'New Institution Added!' })
				})
			})
		}
	})
}

// Receive institution info
institutionService.get = function(req, res) {
	InstitutionModel.findOne( {
		where: { id: req.params.id }
	}).then(function(institution) {
		if(!institution) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Institution not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(institution)
		}
	}).catch(function(error) {
        errLogger.error('Get Institution Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive institution info list
institutionService.getList = function(req, res) {
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
	InstitutionModel.findAndCountAll(condition).then(function(institutions) {
		if(!institutions) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Institution not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(institutions)
		}
	}).catch(function(error) {
        errLogger.error('Get Institution Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Update institution info
institutionService.update = function(req, res){
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.name || !req.body.main_color) {
			if(req.file){
				fs.unlink("./public/institution/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
        	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
	    } else {
			// check in institution table, if code exist or not
			InstitutionModel.findOne({
				where: { id: req.params.id }
			}).then(function(institution) {
				if(!institution) {
					if(req.file){
						fs.unlink("./public/institution/"+ req.file.filename, function(err){
							if (err) {
								console.log("Failed to delete local image:" + err)
							}						
						})
					}
					res.status(httpStatus.NOT_ALLOW).json({ message: 'Institution not Found!' })
				} else {
					// update institution data
					var institution_data = req.body
					if(req.file){
						fs.unlink("./public" + institution.logo_path, function(err){
							if (err) {
								console.log("Failed to delete local image:" + err)
							}						
						})
						institution_data.logo_path = '/institution/'+req.file.filename
					}
					institution.update(institution_data).then(function(){
						res.status(httpStatus.OKAY).json({message: 'Institution Data Updated'})
					})
				}
			})
		}
	})
}

// Delete institution info
institutionService.del = function(req, res) {
	InstitutionModel.findOne({
		where: { id: req.params.id }
	}).then(function(institution) {
		if(!institution) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Institution not Found!' })
		} else {
			// delete institution data
			institution.destroy().then(function(){
				// delete institution image
				fs.unlink("./public" + institution.logo_path, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
                res.status(httpStatus.OKAY).json({message: 'Institution Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Institution Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = institutionService;