// The enrolment model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
	courseModel = require('../model/courseModel'),
	studentModel = require('../model/studentModel'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('enrolmentErrLog');

// 1: The model schema.
var modelDefinition = {
    course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
		references: {
			model: courseModel,
			key: 'id',
		}
    },

    student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
		references: {
			model: studentModel,
			key: 'id',
		}
    },

    deposit: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    
    balance_due: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
	
	status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    note: {
        type: Sequelize.STRING(2048),
        allowNull: true
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the enrolment model.
var EnrolmentModel = db.define('enrolment', modelDefinition, modelOptions);

// 4: Associate with other model
EnrolmentModel.belongsTo(courseModel, {foreignKey:'course_id'});
EnrolmentModel.belongsTo(studentModel, {foreignKey:'student_id'});

module.exports = EnrolmentModel;