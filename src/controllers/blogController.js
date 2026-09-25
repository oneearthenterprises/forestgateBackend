import mongoose from "mongoose";
import Blog from "../models/blog.js";
import cloudinary from "../config/cloudinary.js";

// Helper: Upload base64 image to Cloudinary
const handleBlogImage = async (imageString) => {
  if (!imageString) return imageString;
  // If it's a base64 string, upload to Cloudinary
  if (imageString.startsWith("data:image/")) {
    try {
      const uploadRes = await cloudinary.uploader.upload(imageString, {
        folder: "forestgate/blogs",
        resource_type: "image",
      });
      return uploadRes.secure_url;
    } catch (uploadErr) {
      console.error("Cloudinary Blog Image Upload Error:", uploadErr);
      return imageString; // fallback to existing string
    }
  }
  return imageString;
};

// CREATE single blog
export const createBlog = async (req, res) => {
  try {
    const { title } = req.body;

    // auto-generate slug from title if not explicitly provided
    let slug =
      req.body.slug ||
      title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") ||
      `blog-${Date.now()}`;

    // ensure unique slug via simple randomized suffix if duplicate
    const existing = await Blog.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    let imageUrl = req.body.image;
    if (imageUrl) {
      imageUrl = await handleBlogImage(imageUrl);
    }

    const blog = new Blog({
      ...req.body,
      image: imageUrl,
      slug,
    });
    const savedBlog = await blog.save();
    return res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Server error creating blog", error: error.message });
  }
};

// GET all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Server error fetching blogs", error: error.message });
  }
};

// GET single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return res.status(500).json({ message: "Server error fetching blog", error: error.message });
  }
};

// UPDATE blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    let updateData = { ...req.body };
    if (updateData.image) {
      updateData.image = await handleBlogImage(updateData.image);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Server error updating blog", error: error.message });
  }
};

// DELETE blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ message: "Server error deleting blog", error: error.message });
  }
};
