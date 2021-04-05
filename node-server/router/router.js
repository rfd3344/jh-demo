const express = require('express');
const router= express.Router();

const productsRouter = require('./products');
const homeController = require(baseDir+'/controller/homeController');
const productsController = require(baseDir+'/controller/productsController');


router.route('/').get(homeController.index);
router.route('/404').get(homeController.notFound);




router.use('/products', productsRouter);


module.exports = router;
