const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// --- NEW: Added getUploadSignature to bypass Vercel 4.5MB limit ---
// This endpoint gives the frontend a secure signature so it can upload directly to Cloudinary
exports.getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp: timestamp },
      process.env.API_SECRET
    );
    res.status(200).json({
      timestamp,
      signature,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.API_KEY
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate signature", error: err.message });
  }
};

// Add Product
exports.addProduct = async (req, res) => {
  try {
    // --- CHANGED: Now we receive the direct Cloudinary URLs from the frontend ---
    // We no longer process req.files here because Vercel blocks files > 4.5MB
    const { name, category, price, originalPrice, image, galleryUrls } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: "Main image URL is required" });
    }

    const product = new Product({
      name,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice),
      image: image, // Use the URL sent from the frontend
      gallery: galleryUrls || [] // Use the gallery URLs sent from the frontend
    });

    await product.save();
    res.status(201).json({ message: "Product Added!", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};




// Helper: Extract Cloudinary public_id from URL accurately
const getPublicId = (url) => {
  const splitUrl = url.split('/');
  const uploadIndex = splitUrl.findIndex(part => part === 'upload');
  
  if (uploadIndex !== -1) {
    // Skip the version number (e.g., v1612345678) and grab the rest of the path
    const pathParts = splitUrl.slice(uploadIndex + 2); 
    const fullPath = pathParts.join('/');
    // Remove the file extension (.jpg, .mp4, etc.)
    return fullPath.substring(0, fullPath.lastIndexOf('.'));
  }
  return null;
};

// Helper: Check if URL is a video
const getResourceType = (url) => {
  if (url.match(/\.(mp4|webm|mov|ogg)$/i) || url.includes('/video/upload/')) {
    return 'video';
  }
  return 'image';
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 1. Delete Main Image
    if (product.image) {
      const publicId = getPublicId(product.image);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: getResourceType(product.image) });
      }
    }

    // 2. Delete Gallery Items (Images & Videos)
    if (product.gallery && product.gallery.length > 0) {
      for (const itemUrl of product.gallery) {
        const publicId = getPublicId(itemUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: getResourceType(itemUrl) });
        }
      }
    }

    // 3. Delete from MongoDB
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Product and associated media deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Delete Failed", error: err.message });
  }
};
