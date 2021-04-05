
const couchDBUrl = `http://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/`;
const nano = require('nano')(couchDBUrl);
const _ = require('lodash');


function CouchDB(dbName) {
	// constructor
	this.dbName = dbName;
	this.database = nano.db.use(dbName);
	this.queryError = {};

}

// database operate
CouchDB.prototype.createDBAsync = function() {
	return new Promise((resolve, reject) => {
		nano.db.create(this.dbName).then(body => {
			return;
		}).catch(err => {
			this.queryError = err;
			reject(err);
		});;
	});
}

CouchDB.prototype.destroyDBAsync = function() {
	return new Promise((resolve, reject) => {
		nano.db.destroy(this.dbName).then(body => {
			return;
		}).catch(err => {
			this.queryError = err;
			reject(err);
		});;
	});
}

CouchDB.prototype.processErrors = function() {
	if(this.queryError.reason === 'Database does not exist.') {
		// reason: 'Database does not exist.'
		return this.createDBAsync();
	}
}


//  operations(update/delete/insert) on the docs
CouchDB.prototype.bulkDocsAsync = function(documents = {}) {
	return new Promise((resolve, reject) => {
		this.database.bulk({docs:documents}).then(body => {
			console.log(body);
			const isPass = body.every(item => item.ok);
			if(isPass) {
				resolve(body);
			}

		}).catch(err => {
			this.queryError = err;
			this.processErrors();
			reject(err);
		});
	});
}




// search docs
CouchDB.prototype.getAllDocsAsync = function() {
	return new Promise((resolve, reject) => {
		this.database.list({include_docs: true}).then(body => {
			const docs = body.rows.map(doc => {
				return doc.doc;
			});
			resolve(docs);
		}).catch(err => {
			this.queryError = err;
			reject(err);
		});
	});
}

CouchDB.prototype.getDocsByViewAsync = function(designName = 'views', viewName = 'food') {
	return new Promise((resolve, reject) => {
		this.database.view(designName, viewName, { include_docs: true }).then((body) => {
			const docs = body.rows.map(doc => {
				return doc.doc;
			});
			resolve(docs);
		}).catch(err => {
			this.queryError = err;
			reject(err);
		});;
	});
}

module.exports = CouchDB;
