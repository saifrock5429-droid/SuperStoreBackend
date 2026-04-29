const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true }, 
  // This will store all 4 images and 1 video URL as strings in an array
  gallery: [{ type: String }],            
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);