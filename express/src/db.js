'use strict';

var config = require('./config').get(process.env.NODE_ENV),
	mysql = require('mysql'),
    Sequelize = require('sequelize'),
	logger = require('./common/logger').getLogger();

module.exports = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    config.db.details
);

function handleError (err) {
    if (err) {
        // reconnect if errors occur
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connect();
        } else {
            console.error(err.stack || err);
        }
    }
}

function connect () {
    var con = mysql.createConnection({
		host: config.db.details.host,
		user: config.db.user,
		password: config.db.password
	});
	
	con.connect(function(err) {
		if (err) throw err;
		logger.info("Database Connected!");
		con.query("CREATE DATABASE IF NOT EXISTS education_database", function (err, result) {
			if (err){
				throw err;
			} else {
				if (result.warningCount == 0){
					logger.info('Database Created!');
				} else {
					logger.info('Database Exists!');
				}
			}
		});
	});
}

module.exports.connect = connect;


