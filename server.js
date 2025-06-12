// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // For environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to allow cross-origin requests and parse JSON bodies
app.use(cors());
app.use(express.json());

// Optional: Simple request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Async function to connect to MongoDB with error handling
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog-editor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
connectDB();

// Define Mongoose schema and model for blog posts
const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'] },
  content: { type: String, required: [true, 'Content is required'] },
  tags: {
    type: [String],
    default: [],
    set: tags => Array.isArray(tags) ? tags : [],
  },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Middleware to update updated_at before save and update
blogSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});
blogSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

// ------------------ ROUTES ------------------

// Save or update a draft
app.post('/api/blogs/save-draft', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Normalize tags to array of strings
    const tagArray = Array.isArray(tags) ? tags : [];

    const updateData = {
      title,
      content,
      tags: tagArray,
      status: 'draft',
    };

    let blog;
    if (id) {
      // Update existing draft, run validators
      blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!blog) return res.status(404).json({ error: 'Draft not found' });
    } else {
      // Create new draft
      blog = new Blog(updateData);
      await blog.save();
    }

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draft', message: err.message });
  }
});

// Publish a blog (new or update existing)
app.post('/api/blogs/publish', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const tagArray = Array.isArray(tags) ? tags : [];

    const updateData = {
      title,
      content,
      tags: tagArray,
      status: 'published',
    };

    let blog;
    if (id) {
      blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
    } else {
      blog = new Blog(updateData);
      await blog.save();
    }

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish blog', message: err.message });
  }
});

// Get all blogs (both drafts and published)
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updated_at: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs', message: err.message });
  }
});

// Get a blog by its ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog', message: err.message });
  }
});

// DELETE a blog by id
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Blog not found' });
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog', message: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
