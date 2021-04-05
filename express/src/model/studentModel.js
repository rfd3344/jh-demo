// The student model.
'use strict'; 

var Sequelize = require('sequelize'),
    bcrypt = require('bcrypt');

var config = require('../config').get(process.env.NODE_ENV),
    db = require('../db');

// 1: The model schema.
var modelDefinition = {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
	
	email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
	
	avatar_path: {
        type: Sequelize.STRING,
        allowNull: true
    },
	
	account_type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: config.userRoles.student
    },
	
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
	
	auth_id: {
        type: Sequelize.STRING,
        allowNull: true
    },

    phone_no: {
        type: Sequelize.STRING,
        allowNull: true
    },

    university: {
        type: Sequelize.STRING,
        allowNull: true
    },

    subject: {
        type: Sequelize.STRING,
        allowNull: true
    },

    student_id: {
        type: Sequelize.STRING,
        allowNull: true
    }
};

// 2: The model options.
var modelOptions = {
    instanceMethods: {
        comparePasswords: comparePasswords
    },
    hooks: {
        beforeValidate: hashPassword,
        beforeUpdate: function(user, options, fn) {
            // disable validate again when updating user info
            options.validate = false
            fn(null,user)
        }
    }
};
// 3: Define the student model.
var studentModel = db.define('student', modelDefinition, modelOptions);

// Compares two passwords.
function comparePasswords(password, callback) {
    bcrypt.compare(password, this.password, function(error, isMatch) {
        if(error) {
            return callback(error)
        }
        return callback(null, isMatch)
    })
}

// Hashes the password for a user object.
function hashPassword(user) {
    if(user.changed('password')) {
        //logger.debug(user.password)
        return bcrypt.hash(user.password, 10).then(function(password) {
            //logger.debug(password)
            user.password = password
        })
    }
}

module.exports = studentModel;