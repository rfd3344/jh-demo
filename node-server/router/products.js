const express = require('express');
const path = require('path');
const router= express.Router();

const productsController = require(baseDir + '/controller/productsController');

const controller = new productsController();

// get all products
router.get('/', (request, response) => {
	const allProducts = [];
	controller.getAllProducts().then(res => {
		response.send(res);
	});
});

router.get('/createDBAsync', (request, response) => {
	const allProducts = [];
	controller.createDBAsync().then(res => {
		response.send(res);
	});
});

router.get('/addProducts', (request, response) => {
	const products = [{
			"name": "pro1",
			"type": "food",
			"price": 100,
			"subtype": "pizza",
			"restaurantName": "restaurant111",
			"cuisines" : ["Mediterranean", "Spanish"]
		},
		{
			'name': 'pro2',
	}];
	controller.addProducts(products).then(res => {
		response.send(res);
	});
});

router.get('/getDocsByViewAsync', (request, response) => {

	controller.getDocsByViewAsync('views', 'food').then(res => {
		response.send(res);
	});
});

router.route('/:id').get((request, response) => {
	response.send('product id: '+ response.params.id);
})


module.exports = router;
