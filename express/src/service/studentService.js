'use strict';

var jwt = require('jsonwebtoken'),
	multer = require('multer'),
	fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    StudentModel = require('../model/studentModel'),
    EnrolmentModel = require('../model/enrolmentModel'),
    CourseModel = require('../model/courseModel'),
    TeacherModel = require('../model/teacherModel'),
    FavoriteModel = require('../model/favoriteModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('studentErrLog'),
	validator = require("email-validator");
	
// Add storage
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, "./public/student")
  },
  filename: function(req, file, callback){
    callback(null, "avatar" + '-' + Date.now() + ".jpg")
  }
})

var upload = multer({
  storage: storage
}).single('avatar')

// The student service.
var studentService = {};

// Student SignUp
studentService.signUp = function(req, res) {
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.name || !validator.validate(req.body.email) || !req.body.account_type) {
			if(req.file){
				fs.unlink("./public/student/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
			res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Please provide all the student data.'})
		} 
		else {
			// check student exists or not
			StudentModel.findOne({
				where: { 
                   	email: req.body.email
				}
			}).then(function(student) {
				if(student) {
					if(req.file){
						fs.unlink("./public/student/"+ req.file.filename, function(err){
							if (err) {
								console.log("Failed to delete local image:" + err)
							}						
						})
					}
					res.status(httpStatus.NOT_ALLOW).json({ message: 'Username or Email Already Exists!' })
				} 
				else {
					// create a student account in the database
					db.sync().then(function() {
						var newStudent = req.body
						if(req.file){
							newStudent.avatar_path = '/student/'+req.file.filename
						}
						logger.debug(newStudent)
						return StudentModel.create(newStudent).then(function() {
							res.status(httpStatus.CREATED).json({ message: 'Account created!' })
						})
					}).catch(function(error) {
						if(req.file){
							fs.unlink("./public/student/"+ req.file.filename, function(err){
								if (err) {
									console.log("Failed to delete local image:" + err)
								}						
							})
						}
						errLogger.error('Student SignUp Error:\n' + error)
						res.status(httpStatus.NOT_ALLOW).json({ message: 'Server Internal Error!' })
					})
				}
			})
		}
	})
}

// Student Login
studentService.logIn = function(req, res) {
    if(!req.body.email || !req.body.password) {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Email and password are needed!' })
    } else {
		// find potential student
        var potentialstudent = { 
            where: {
                //$or: [
                //    { name: req.body.name },
                email: req.body.email
                //]
            } 
        }
        StudentModel.findOne(potentialstudent).then(function(student) {
            if(!student) {
                res.status(httpStatus.NOT_FOUND).json({ message: 'Student not Found!' })
            } else {
                // check password
                student.comparePasswords(req.body.password, function(error, isMatch) {
                    if(isMatch && !error) {
                        // update is_login field
                        logger.debug(student)
						// generate login token 
						var token = jwt.sign(
							{ 
								id: student.id,
								email: student.email,
								is_student: true
							},
							config.keys.secret,
							{ expiresIn: '12h' }
						)
						logger.debug(token)
	   
						// reply login token
						res.status(httpStatus.OKAY).json({
							token: 'JWT ' + token
						})                    
                    } else {
                        res.status(httpStatus.NOT_ALLOW).json({ message: 'Invalid studentname or Password!' })
                    }
                })
            }
        }).catch(function(error) {
            errLogger.error('Student Login Error:\n' + error)
            res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
        })
    }
}

// Get Student Info
studentService.getInfo = function(req, res) {
    //logger.debug(req.user)
    if(req.user){
        // reply student info without password
        return res.status(httpStatus.OKAY).json({
            id: req.user.id,
			name: req.user.name,
            email: req.user.email,
			avatar_path: req.user.avatar_path,
			auth_id: req.user.auth_id,
			phone_no: req.user.phone_no,
			subject: req.user.subject,
			university: req.user.university,
			student_id: req.user.student_id,
            createdAt: req.user.createdAt
        })
    } else {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Student not Found!' })
    }
}

// Receive student courses
studentService.getCourses = function(req, res) {
	EnrolmentModel.findAndCountAll( {
		include: [{
	        model: CourseModel,
	        as: 'course'
    	}],
		where: { student_id: req.user.id }
	}).then(function(enrolments) {
		if(!enrolments) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Course not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(enrolments)
		}
	}).catch(function(error) {
        errLogger.error('Get Student Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive student favorites
studentService.getFavorites = function(req, res) {
	FavoriteModel.findAndCountAll( {
		include: [{
	        model: CourseModel,
	        as: 'course'
    	}],
		where: { student_id: req.user.id }
	}).then(function(favorites) {
		if(!favorites) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Course not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(favorites)
		}
	}).catch(function(error) {
        errLogger.error('Get Student Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Student Update Info
studentService.updateInfo = function(req, res) {
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.name){
			req.body.name = req.user.name
		}
		if(!req.body.phone_no){
			req.body.phone_no = req.user.phone_no
		}
		if(!req.body.student_id){
			req.body.student_id = req.user.student_id
		}
		if(!req.body.subject){
			req.body.subject = req.user.subject
		}
		if(!req.body.university){
			req.body.university = req.user.university
		}
		if(req.file){
			fs.unlink("./public" + req.user.avatar_path, function(err){
				if (err) {
					console.log("Failed to delete local image:" + err)
				}						
			})
			req.body.avatar_path = '/student/'+req.file.filename
		} else {
			req.body.avatar_path = req.user.avatar_path
		}
		// update password
		//logger.debug(req.user)
		req.user.update({
			name: req.body.name,
			phone_no: req.body.phone_no,
			student_id: req.body.student_id,
			subject: req.body.subject,
			university: req.body.university,
			avatar_path: req.body.avatar_path
		}).then(function(){
			res.status(httpStatus.OKAY).json({message: 'Student Info Updated'})
		}).catch(function(error) {
			if(req.file){
				fs.unlink("./public/student/"+ req.file.filename, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
			}
			errLogger.error('Student Update Info Error:\n' + error)
			res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
		})
	})
}

// Student Update Password
studentService.updatePwd = function(req, res) {
    if(!req.body.old_password || !req.body.new_password) {
        res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Please provide the old password and a new password.'})
    } 
    else {
        // check password
        req.user.comparePasswords(req.body.old_password, function(error, isMatch) {
            if(isMatch && !error) {
                // update password
                //logger.debug(req.user)
                req.user.update({
                    password: req.body.new_password
                }).then(function(){
                    res.status(httpStatus.OKAY).json({message: 'Student Password Updated'})
                }).catch(function(error) {
                    errLogger.error('Student Update Password Error:\n' + error)
                    res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
                })
            } else {
                res.status(httpStatus.NOT_ALLOW).json({ message: 'Invalid old password provided!' })
            }
        })
    }
}

// Create new student
/*
studentService.add = function(req, res) {
	if(!req.body.name || !req.body.wechat_id || !req.body.email || !req.body.phone_no || !req.body.student_id || !req.body.subject ) {
    	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
    } else {
		// check in student table, if wechat_id exist or not
		StudentModel.findOne({
			where: { 
				wechat_id: req.body.wechat_id,
			}
		}).then(function(student) {
			if(student) {
				res.status(httpStatus.CREATED).json({ student })
			} else {
				// add student data into database
				db.sync().then(function() {
					var student_data = req.body
					logger.debug(student_data)
					StudentModel.create(student_data).then(function(student) {
						res.status(httpStatus.CREATED).json({ student })
					})
				})
			}
		})
	}
}
*/

// Receive student info
studentService.get = function(req, res) {
	StudentModel.findOne( {
		where: { id: req.params.id }
	}).then(function(student) {
		if(!student) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Student not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(student)
		}
	}).catch(function(error) {
        errLogger.error('Get Student Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive student info list
studentService.getList = function(req, res) {
	//console.log(req.query)
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
	StudentModel.findAndCountAll(condition).then(function(students) {
		if(!students) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Student not Found!' })
		} else {
			res.status(httpStatus.OKAY).json(students)
		}
	}).catch(function(error) {
        errLogger.error('Get Student Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Update student info
/*
studentService.update = function(req, res){
	if(!req.body.name || !req.body.wechat_id || !req.body.email || !req.body.phone_no || !req.body.student_id || !req.body.subject ) {
    	res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
    } else {
		// check in student table, if code exist or not
		StudentModel.findOne({
			where: { id: req.params.id }
		}).then(function(student) {
			if(!student) {
				res.status(httpStatus.NOT_ALLOW).json({ message: 'Student not Found!' })
			} else {
				// update student data
				var student_data = req.body
				student.update(student_data).then(function(){
					res.status(httpStatus.OKAY).json({message: 'Student Data Updated'})
				})
			}
		})
	}
}
*/

// Delete student info
studentService.del = function(req, res) {
	StudentModel.findOne({
		where: { id: req.user.id }
	}).then(function(student) {
		if(!student) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Student not Found!' })
		} else {
			// delete student data
			student.destroy().then(function(){
                res.status(httpStatus.OKAY).json({message: 'Student Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Student Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = studentService;