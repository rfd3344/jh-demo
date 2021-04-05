
const envVariables = require('./env');
global = Object.assign(global, envVariables);
global.baseDir = __dirname;
console.log('********************* loaded env *********************************');
console.log('env:', envVariables);


const express = require('express');
const app = express();
app.use(function (req, res, next) {
	// show API name and time
	console.log('calling API:', req.originalUrl, 'at: ', new Date().toLocaleTimeString());
	next();
});
console.log('********************* started server *****************************');




const router = require('./router/router');
app.use('/', router); // define all routers at /router/index.js


/* istanbul ignore next */
if (!module.parent) {
	const port = global.localPort;
	app.listen(port);
	console.log('Server started on port:', port);
}
