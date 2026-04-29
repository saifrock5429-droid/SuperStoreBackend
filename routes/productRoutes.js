const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct, deleteProduct } = require('../controllers/productController');

router.get('/all', getAllProducts);
router.post('/add', addProduct);
router.delete('/delete/:id', deleteProduct);

module.exports = router;