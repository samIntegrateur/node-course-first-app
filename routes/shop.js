const express = require('express');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// get requires an exact path (with use, order would matter, it should be last route)
// router.get('/', shopController.getIndex);
router.get('/', shopController.getProducts);

router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);
router.get('/checkout/cancel', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
