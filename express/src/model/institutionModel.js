// The institution model.
'use strict'; 

var Sequelize = require('sequelize');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db'),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('institutionErrLog');

// 1: The model schema.
var modelDefinition = {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    logo_path: {
        type: Sequelize.STRING,
        allowNull: false
    },

    main_color: {
        type: Sequelize.INTEGER,
        allowNull: true,
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {},
    hooks: {}
};

// 3: Define the institution model.
var InstitutionModel = db.define('institution', modelDefinition, modelOptions);

module.exports = InstitutionModel;