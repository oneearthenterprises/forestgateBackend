import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: String, required: true, default: "Admin" },
    category: { type: String, required: true },
    shortDescription: { type: String }, // Used as an excerpt or test description
    metaTitle: { type: String }, // SEO Title
    metaDescription: { type: String }, // SEO Description
    image: { type: String }, // Main featured image
    blurImage: { type: String }, // Blur placeholder or low-res version
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

export default Blog;
