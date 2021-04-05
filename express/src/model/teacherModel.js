// The teacher model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    institutionModel = require('../model/institutionModel'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('teacherErrLog');

// 1: The model schema.
var modelDefinition = {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    title: {
        type: Sequelize.STRING,
        allowNull: true
    },
    
    institution_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: institutionModel,
            key: 'id',
        }
    },
    
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },

    photo_path: {
        type: Sequelize.STRING,
        allowNull: true
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the teacher model.
var TeacherModel = db.define('teacher', modelDefinition, modelOptions);

module.exports = TeacherModel;