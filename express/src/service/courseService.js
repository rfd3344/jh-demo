'use strict';

var jwt = require('jsonwebtoken'),
    multer = require('multer'),
    fs = require('fs');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    CourseModel = require('../model/courseModel'),
	TeacherModel = require('../model/teacherModel'),
	InstitutionModel = require('../model/institutionModel'),
	EnrolmentModel = require('../model/enrolmentModel'),
	FavoriteModel = require('../model/favoriteModel'),
	UniversityModel = require('../model/universityModel'),
    SubjectModel = require('../model/subjectModel'),
    StudentModel = require('../model/studentModel'),
	httpStatus = require('../common/httpStatus'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('courseErrLog'),
    Promise = require('bluebird');

// Add storage
var storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, "./public/course")
  },
  filename: function(req, file, callback){
    callback(null, "course" + '-' + Date.now() + ".jpg")
  }
})

var upload = multer({
  storage: storage
}).single('image')

// The course service.
var courseService = {};

// Create new course
courseService.add = function(req, res) {
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
		if(!req.body.name || !req.body.code || !req.body.teacher_id || !req.body.university_id || !req.body.subject_id || !req.body.description || !req.body.time || !req.body.fee || !req.body.deposit) {
			if(req.file){
				fs.unlink("./public/course/"+ req.file.filename, function(err){
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
					// check teacher id exists or not
					TeacherModel.findOne({
						where: { id: req.body.teacher_id }
					}).then(function(teacher) {
						if(!teacher) {
							if(req.file){
								fs.unlink("./public/course/"+ req.file.filename, function(err){
									if (err) {
										console.log("Failed to delete local image:" + err)
									}						
								})
							}
							res.status(httpStatus.NOT_ALLOW).json({ message: 'Teacher not Found!' })
						} 
						else {
							// check university id exists or not
							UniversityModel.findOne({
								where: { id: req.body.university_id }
							}).then(function(university) {
								if(!university) {
									if(req.file){
										fs.unlink("./public/course/"+ req.file.filename, function(err){
											if (err) {
												console.log("Failed to delete local image:" + err)
											}						
										})
									}
									res.status(httpStatus.NOT_ALLOW).json({ message: 'University not Found!' })
								} 
								else {
									// check subject id exists or not
									SubjectModel.findOne({
										where: { id: req.body.subject_id }
									}).then(function(subject) {
										if(!subject) {
											if(req.file){
												fs.unlink("./public/course/"+ req.file.filename, function(err){
													if (err) {
														console.log("Failed to delete local image:" + err)
													}						
												})
											}
											res.status(httpStatus.NOT_ALLOW).json({ message: 'Subject not Found!' })
										} 
										else {
											// add course data into database
											db.sync().then(function() {
												var course_data = req.body
				                                course_data.institution_id = req.user.institution_id
												if(req.file){
													course_data.image_path = '/course/'+req.file.filename
												}
						                        course_data.count_of_enrol = 0
												logger.debug(course_data)
												CourseModel.create(course_data).then(function() {
													res.status(httpStatus.CREATED).json({ message: 'New Course Added!' })
												})
											})
										}
									})
								}
							})
						}
		            })
				}
			})
		}
	})
}

// Receive course info with enrolment info
courseService.get = function(req, res) {
	CourseModel.findOne( {
    	include: [{
	        model: TeacherModel,
	        as: 'teacher'
    	},{
	        model: UniversityModel,
	        as: 'university'
    	},{
	        model: SubjectModel,
	        as: 'subject'
    	}],
		where: { 
			id: req.params.id
		}
	}).then(function(course) {
		if(!course) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Course not Found!' })
		} else {
			EnrolmentModel.findAndCountAll({
				include: [{
			        model: StudentModel,
			        as: 'student'
		    	}],
				where: { course_id: course.id }
			}).then(function(enrolments){
				//var course_info = course
				var course_info = {}
                var info = {}
                info.id = course.id
                info.name = course.name
                info.code = course.code
                info.count_of_enrol = course.count_of_enrol
                info.description = course.description
                info.image_path = course.image_path
                info.time = course.time
                info.fee = course.fee
                info.deposit = course.deposit
                info.teacher = course.teacher
                info.university = course.university
                info.subject = course.subject
                info.createdAt = course.createdAt
                info.updatedAt = course.updatedAt
				course_info.info = info
				course_info.count_of_enrol = enrolments.count
				course_info.enrolments = enrolments.rows
				res.status(httpStatus.OKAY).json(course_info)
			})
			
		}
	}).catch(function(error) {
        errLogger.error('Get Course Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive course info
courseService.getDetail = function(req, res) {
	CourseModel.findOne( {
    	include: [{
	        model: InstitutionModel,
	        as: 'institution'
    	},{
	        model: TeacherModel,
	        as: 'teacher'
    	},{
	        model: UniversityModel,
	        as: 'university'
    	},{
	        model: SubjectModel,
	        as: 'subject'
    	}],
		where: { 
			id: req.params.id
		}
	}).then(function(course) {
		if(!course) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Course not Found!' })
		} else {
			var course_info = course.toJSON()
			if(req.headers.authorization){
				// verify authorization
		        jwt.verify(req.headers.authorization.replace(/^JWT\s/, ''), config.keys.secret, function(err, user) {      
					if (err || !user.is_student) {
						console.log(err)
						course_info.enrol = 0
						course_info.favorite = 0
						res.status(httpStatus.OKAY).json(course_info)
					} else {
		                EnrolmentModel.findOne({
							where: {
								student_id: user.id,
								course_id: course.id
							}
						}).then(function(enrolment){
							if(enrolment){
								course_info.enrol = 1
							} else {
								course_info.enrol = 0
							}
							FavoriteModel.findOne({
								where: {
									student_id: user.id,
									course_id: course.id
								}
							}).then(function(favorite){
								if(favorite){
									course_info.favorite = 1
								} else {
									course_info.favorite = 0
								}
								res.status(httpStatus.OKAY).json(course_info)
							})
						})
		            }
		        })
			} else {
				course_info.enrol = 0
				course_info.favorite = 0
				res.status(httpStatus.OKAY).json(course_info)
			}
		}
	}).catch(function(error) {
        errLogger.error('Get Course Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Receive course info list
courseService.getList = function(req, res) {
	var condition = {
		include: [{
	        model: TeacherModel,
	        as: 'teacher'
    	},{
	        model: InstitutionModel,
	        as: 'institution'
    	},{
	        model: UniversityModel,
	        as: 'university'
    	}]
	}
	if (req.query.limit && req.query.page) {
		if(parseInt(req.query.limit) < 0 || parseInt(req.query.page) < 0){
			res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
		} else {
			condition.limit = parseInt(req.query.limit)
			condition.offset = (parseInt(req.query.page) - 1) * parseInt(req.query.limit)
		}
	}  
	var where = {}
    if(req.query.institution_id){
       where.institution_id = parseInt(req.query.institution_id)
    }
    if(req.query.university_id){
        where.university_id = parseInt(req.query.university_id)
    }
    if(req.query.subject_id){
        where.subject_id = parseInt(req.query.subject_id)
    }
    condition.where = where
	CourseModel.findAndCountAll(condition).then(function(courses) {
		if(!courses) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Course not Found!' })
		} else {
			//res.status(httpStatus.OKAY).json(courses)
			var courses_info = {}
			courses_info.count = courses.count
			courses_info.rows = []
			courses.rows.forEach(function(course){
				courses_info.rows.push(course.toJSON())
			})

			if(req.headers.authorization){
				// verify authorization
		        jwt.verify(req.headers.authorization.replace(/^JWT\s/, ''), config.keys.secret, function(err, user) {      
					if (err || !user.is_student) {
						console.log(err)
						courses_info.rows.forEach(function(course_info){
							course_info.enrol = 0
							course_info.favorite = 0
						})
						res.status(httpStatus.OKAY).json(courses_info)
					} else {
						let promises = [];
						courses_info.rows.forEach(function(course_info){
							promises.push(
								EnrolmentModel.findOne({
									where: {
										student_id: user.id,
										course_id: course_info.id
									}
								}).then(function(enrolment){
									if(enrolment){
										course_info.enrol = 1
									} else {
										course_info.enrol = 0
									}
								})
							)
						})
						Promise.all(promises).then(function(promise){
							courses_info.rows.forEach(function(course_info){
								promises.push(
									FavoriteModel.findOne({
										where: {
											student_id: user.id,
											course_id: course_info.id
										}
									}).then(function(favorite){
										if(favorite){
											course_info.favorite = 1
										} else {
											course_info.favorite = 0
										}
									})
								)
							})
							Promise.all(promises).then(function(promise){
								res.status(httpStatus.OKAY).json(courses_info)
							})
						})
					}
				})
		    } else {
				courses_info.rows.forEach(function(course_info){
					course_info.enrol = 0
					course_info.favorite = 0
				})
				res.status(httpStatus.OKAY).json(courses_info)
		    }
		}
	}).catch(function(error) {
        errLogger.error('Get Course Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

// Update course info
courseService.update = function(req, res){
	upload(req, res, function(err){
		//logger.debug(req.file)
		//logger.debug(req.body)
		if(err) {
			errLogger.error('Upload Image Error:\n' + err)
			return res.status(httpStatus.SERVER_ERROR).json({message: 'Upload Image Failed'})
		} 
        if(!req.body.name || !req.body.code || !req.body.teacher_id || !req.body.university_id || !req.body.subject_id || !req.body.description || !req.body.time || !req.body.fee || !req.body.deposit) {
            if(req.file){
                fs.unlink("./public/course/"+ req.file.filename, function(err){
                    if (err) {
                        console.log("Failed to delete local image:" + err)
                    }						
                })
            }
            res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'Invalid Parameters Provided!'})
        } 
        else {
            // check in course table, if code exist or not
            CourseModel.findOne({
                where: { id: req.params.id }
            }).then(function(course) {
                if(!course) {
                    if(req.file){
                        fs.unlink("./public/course/"+ req.file.filename, function(err){
                            if (err) {
                                console.log("Failed to delete local image:" + err)
                            }						
                        })
                    }
                    res.status(httpStatus.NOT_ALLOW).json({ message: 'Course not Found!' })
                } else {
                    // check teacher id exists or not
                    TeacherModel.findOne({
                        where: { id: req.body.teacher_id }
                    }).then(function(teacher) {
                        if(!teacher) {
                            if(req.file){
                                fs.unlink("./public/course/"+ req.file.filename, function(err){
                                    if (err) {
                                        console.log("Failed to delete local image:" + err)
                                    }						
                                })
                            }
                            res.status(httpStatus.NOT_ALLOW).json({ message: 'Teacher not Found!' })
                        } 
                        else {
                        	// check university id exists or not
							UniversityModel.findOne({
								where: { id: req.body.university_id }
							}).then(function(university) {
								if(!university) {
									if(req.file){
										fs.unlink("./public/course/"+ req.file.filename, function(err){
											if (err) {
												console.log("Failed to delete local image:" + err)
											}						
										})
									}
									res.status(httpStatus.NOT_ALLOW).json({ message: 'University not Found!' })
								} 
								else {
									// check subject id exists or not
									SubjectModel.findOne({
										where: { id: req.body.subject_id }
									}).then(function(subject) {
										if(!subject) {
											if(req.file){
												fs.unlink("./public/course/"+ req.file.filename, function(err){
													if (err) {
														console.log("Failed to delete local image:" + err)
													}						
												})
											}
											res.status(httpStatus.NOT_ALLOW).json({ message: 'Subject not Found!' })
										} 
										else {
				                            // update course data
				                            var course_data = req.body
				                            if(req.file){
				                                fs.unlink("./public" + course.image_path, function(err){
				                                    if (err) {
				                                        console.log("Failed to delete local image:" + err)
				                                    }						
				                                })
				                                course_data.image_path = '/course/'+req.file.filename
				                            }
				                            course.update(course_data).then(function(){
				                                res.status(httpStatus.OKAY).json({message: 'Course Data Updated'})
				                            })
				                        }
				                    })
				                }
				            })
                        }
                    })
                }
            })
        }
	})
}

// Delete course info
courseService.del = function(req, res) {
	CourseModel.findOne({
		where: { id: req.params.id }
	}).then(function(course) {
		if(!course) {
			res.status(httpStatus.NOT_FOUND).json({ message: 'Course not Found!' })
		} else {
			// delete course data
			course.destroy().then(function(){
				// delete course image
				fs.unlink("./public" + course.image_path, function(err){
					if (err) {
						console.log("Failed to delete local image:" + err)
					}						
				})
                res.status(httpStatus.OKAY).json({message: 'Course Info Deleted!'})
			})
		}
	}).catch(function(error) {
        errLogger.error('Delete Course Info Error:\n' + error)
		res.status(httpStatus.SERVER_ERROR).json({ message: 'Server Internal Error!' })
	})
}

module.exports = courseService;