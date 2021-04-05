// Application configuration.
'use strict';

var keys = {
    secret: '/jVdfUX+u/Kn3qPY4+ahjwQgyV5UhkM5cdh1i2xhozE=' // Not anymore...
};

var userRoles = {
    admin: 1,           // ...001
    super_user: 2,     // ...010
    user: 4,            // ...100
    student: 8,         // ..1000
};

var accessLevels = {
    everyone: userRoles.student | userRoles.user | userRoles.super_user | userRoles.admin,  // ..1111
    student_only: userRoles.student,                                                        // ..1000
    user: userRoles.user | userRoles.super_user | userRoles.admin,                          // ..0111
    super_user: userRoles.super_user | userRoles.admin,                                     // ..0011
    admin: userRoles.admin                                                                  // ..0001
};

var admin = {
	username: 'admin',
    email: 'example@houdaoeducation.com',
	password: 'password',
	role: userRoles.admin
};

var config = {
    production: {
        db: {
            user: 'root',
            password: '12345678',
            name: 'education_database',
            details: {
                host: '127.0.0.1',
                port: 3306,
                dialect: 'mysql',
            }
        },
        port: 3000,
        keys: keys,
        userRoles: userRoles,
        accessLevels: accessLevels,
        admin: admin
    },
    test: {
        db: {
            user: 'everone',
            password: 'one123456',
            name: 'education_database',
            details: {
                host: 'everone-database.czenysoaapph.ap-southeast-2.rds.amazonaws.com',
                port: 3306,
                dialect: 'mysql',
            }
        },
        port: 4000,
        keys: keys,
        userRoles: userRoles,
        accessLevels: accessLevels,
        admin: admin
    },
    development: {
        db: {
            user: 'root',
            password: '12345678',
            name: 'education_database',
            details: {
                host: '127.0.0.1',
                port: 3306,
                dialect: 'mysql',
            }
        },
        port: 5000,
        keys: keys,
        userRoles: userRoles,
        accessLevels: accessLevels,
        admin: admin
    }
}

exports.get = function get(env) {
  return config[env] || config.production;
}
