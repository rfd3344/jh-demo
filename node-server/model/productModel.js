const couchDB = require(baseDir + '/helper/couchDB');



function productModel() {
	this.dbName = global.clientPrefix + 'products';
	couchDB.call(this, this.dbName); // similar with super()
};

productModel.prototype = Object.create(couchDB.prototype);
productModel.prototype.constructor = couchDB;




module.exports = productModel;
