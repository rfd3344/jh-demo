// The favorite model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
	courseModel = require('../model/courseModel'),
	studentModel = require('../model/studentModel'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('favoriteErrLog');

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
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the favorite model.
var FavoriteModel = db.define('favorite', modelDefinition, modelOptions);

// 4: Associate with other model
FavoriteModel.belongsTo(courseModel, {foreignKey:'course_id'});

module.exports = FavoriteModel;