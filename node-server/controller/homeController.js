const productModel = require(baseDir+'/model/productModel');





exports.index = function(req, res){
	const result = `Node Server API`;
	res.send(result);
};


exports.notFound = function(req, res){
	const result = `not exist page`;
	res.send(result);
};
