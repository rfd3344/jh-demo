// The course model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    institutionModel = require('../model/institutionModel'),
	teacherModel = require('../model/teacherModel'),
    universityModel = require('../model/universityModel'),
    subjectModel = require('../model/subjectModel'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('courseErrLog');

// 1: The model schema.
var modelDefinition = {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    code: {
        type: Sequelize.STRING,
        allowNull: false
    },

    institution_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: institutionModel,
            key: 'id',
        }
    },

    teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
		references: {
			model: teacherModel,
			key: 'id',
		}
    },

    university_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: universityModel,
            key: 'id',
        }
    },

    subject_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: subjectModel,
            key: 'id',
        }
    },
    
    count_of_enrol: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },

    image_path: {
        type: Sequelize.STRING,
        allowNull: true
    },
    
    time: {
        type: Sequelize.STRING,
        allowNull: false
    },
    
    fee: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    
    deposit: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the course model.
var CourseModel = db.define('course', modelDefinition, modelOptions);

// 4: Associate with other model
CourseModel.belongsTo(institutionModel, {foreignKey:'institution_id'});
CourseModel.belongsTo(teacherModel, {foreignKey:'teacher_id'});
CourseModel.belongsTo(universityModel, {foreignKey:'university_id'});
CourseModel.belongsTo(subjectModel, {foreignKey:'subject_id'});

module.exports = CourseModel;