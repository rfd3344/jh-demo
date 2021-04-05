// The university model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('universityErrLog');

// 1: The model schema.
var modelDefinition = {
    english_name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    chinese_name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    uni_image_path: {
        type: Sequelize.STRING,
        allowNull: true
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the university model.
var UniversityModel = db.define('university', modelDefinition, modelOptions);

module.exports = UniversityModel;