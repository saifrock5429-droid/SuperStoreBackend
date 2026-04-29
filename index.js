const express = require("express");
const app = express();
const database = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();
const PORT = process.env.PORT || 5000;

// 1. Connect to Services
database.connect();         
cloudinaryConnect();       

// 2. Middlewares
app.use(express.json());    
app.use(cookieParser()); // Cookies read karne ke liye

// CORS Configuration (Frontend connectivity ke liye best practice)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173","https://super-store-hazel.vercel.app/"], 
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// File Upload Middleware (Temp files ke saath)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// 3. Routes
// Maine versioning add kar di hai (/api/v1/products)
app.use("/api/v1/products", productRoutes);

// Default Health Check Route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "🚀 CHOICESTORE server is up and running!",
    timestamp: new Date().toLocaleTimeString(),
  });
});

// 4. Global Error Handler (Ye zaroori hai crash rokne ke liye)
app.use((err, req, res, next) => {
  console.error("Internal Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Server mein kuch gadbad ho gayi!",
    error: err.message,
  });
});

// 5. Start Server
app.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 Server is running at: http://localhost:${PORT}
  🛠️  Connected to Database & Cloudinary
  ✅ Ready to handle product uploads
  ==========================================
  `);
});