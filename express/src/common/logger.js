var log4js = require('log4js');

// Initialise logger
log4js.configure({
	appenders: {
		userErrLogs: {
			type: 'dateFile', 
			filename: 'logs/user.err.log',
			pattern: 'yyyy-MM-hh',
			maxLogSize: 10*1024*1024,
			numBackups: 5
		},
		courseErrLogs: {
			type: 'dateFile', 
			filename: 'logs/course.err.log',
			pattern: 'yyyy-MM-hh',
			maxLogSize: 10*1024*1024,
			numBackups: 5
		},
		studentErrLogs: {
			type: 'dateFile', 
			filename: 'logs/student.err.log',
			pattern: 'yyyy-MM-hh',
			maxLogSize: 10*1024*1024,
			numBackups: 5
		},
		console: { type:'console' }
	},
	categories: {
		userErrLog: { appenders: ['userErrLogs', 'console'], level: 'error' },
		courseErrLog: { appenders: ['courseErrLogs', 'console'], level: 'error' },
		studentErrLog: { appenders: ['studentErrLogs', 'console'], level: 'error' },
		default: { appenders: ['console'], level: 'trace'}
	}
});

module.exports.getLogger = function(category){
	const logger = log4js.getLogger(category);
	return logger;
}