const express = require('express');
const productsController = require('../controllers/products');

const router = express.Router();

// get requires an exact path (with use, order would matter, it should be last route)
router.get('/', productsController.getProducts);

module.exports = router;
