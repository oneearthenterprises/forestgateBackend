import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Debug: Check what values are being loaded
console.log("=== CLOUDINARY CONFIG DEBUG ===");
console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL);
console.log("==============================");

// Method 1: Parse CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
    console.log("Using CLOUDINARY_URL from environment");

    // Parse the URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const url = process.env.CLOUDINARY_URL;

    // Extract using regex
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

    if (match) {
        const api_key = match[1];      // 553456786286681
        const api_secret = match[2];   // bMcCo9EKBJpyOwLSS-nHMa7UVyA
        const cloud_name = match[3];   // dehi93v0v

        console.log("Parsed from URL:");
        console.log("Cloud Name:", cloud_name);
        console.log("API Key:", api_key);
        console.log("API Secret: ****" + api_secret.slice(-4));

        cloudinary.config({
            cloud_name: cloud_name,
            api_key: api_key,
            api_secret: api_secret,
        });
    } else {
        console.error("ERROR: Invalid CLOUDINARY_URL format");
        console.error("Expected format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
    }
}
// Method 2: Fallback to individual variables
else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log("Using individual Cloudinary environment variables");
    cloudinary.config({

        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
else {
    console.error("ERROR: Cloudinary configuration is missing!");
    console.error("Please set either CLOUDINARY_URL or all three: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file");
}


// Test the configuration 
cloudinary.api.ping()
    .then(() => {
        console.log("✅ Cloudinary configuration is valid!");
        console.log("✅ Cloud name:", cloudinary.config().cloud_name);
    })
    .catch(err => {
        console.error("❌ Cloudinary configuration error:", err.message);
    });

export default cloudinary;