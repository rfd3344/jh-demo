const productModel = require(baseDir + '/model/productModel');

function productsController() {
	this.productModel = new productModel();
};

productsController.prototype.getAllProducts = function() {
	return this.productModel.getAllDocsAsync().then(res => {
		return res;
	});
}

productsController.prototype.addProducts = function(products = []) {
	return this.productModel.bulkDocsAsync(products).then(res => {
		return res;
	});
}

productsController.prototype.getDocsByViewAsync = function() {
	return this.productModel.getDocsByViewAsync('food').then(res => {
		return res;
	});
}





module.exports = productsController;
