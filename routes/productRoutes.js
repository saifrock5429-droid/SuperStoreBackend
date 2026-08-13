const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct, deleteProduct, getUploadSignature, editProduct } = require('../controllers/productController');
router.get('/upload-signature', getUploadSignature);
router.get('/all', getAllProducts);
router.post('/add', addProduct);
router.delete('/delete/:id', deleteProduct);
router.put('/edit/:id', editProduct);

module.exports = router;
