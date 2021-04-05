// The subject model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('subjectErrLog');

// 1: The model schema.
var modelDefinition = {
    english_name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    chinese_name: {
        type: Sequelize.STRING,
        allowNull: false
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the subject model.
var SubjectModel = db.define('subject', modelDefinition, modelOptions);

module.exports = SubjectModel;