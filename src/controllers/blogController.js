import Blog from "../models/blog.js";

// CREATE single blog
export const createBlog = async (req, res) => {
  try {
    const { title } = req.body;
    
    // auto-generate slug from title if not explicitly provided
    let slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // ensure unique slug via simple randomized suffix if duplicate
    const existing = await Blog.findOne({ slug });
    if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const blog = new Blog({
      ...req.body,
      slug
    });
    const savedBlog = await blog.save();
    return res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Server error creating blog", error });
  }
};

// GET all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Server error fetching blogs", error });
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
    return res.status(500).json({ message: "Server error fetching blog", error });
  }
};

// UPDATE blog
export const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Server error updating blog", error });
  }
};

// DELETE blog
export const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ message: "Server error deleting blog", error });
  }
};
