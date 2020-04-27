const express = require('express');
const shopController = require('../controllers/shop');

const router = express.Router();

// get requires an exact path (with use, order would matter, it should be last route)
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);
router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

module.exports = router;
