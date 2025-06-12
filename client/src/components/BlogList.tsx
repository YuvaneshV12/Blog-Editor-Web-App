import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { blogs as initialBlogs } from '../mockData';
import type { Blog } from '../types';

interface BlogListProps {
  onEdit: (blog: Blog) => void;
}

const BlogList: React.FC<BlogListProps> = ({ onEdit }) => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs || []);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get<Blog[]>('https://blog-editor-backend-ai6s.onrender.com/api/blogs');
        if (isMounted) setBlogs(res.data);
      } catch (err) {
        if (isMounted) console.error('Error fetching blogs:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleString('en-IN', {
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSelect = (blog: Blog) => {
    setSelectedBlogId(blog._id);
    onEdit(blog);
  };

  const handleDoubleClick = (blog: Blog) => {
    setViewBlog(blog);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setViewBlog(null), 300);
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`https://blog-editor-backend-ai6s.onrender.com/api/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
      if (selectedBlogId === blogId) setSelectedBlogId(null);
      if (viewBlog && viewBlog._id === blogId) closeModal();
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert('Failed to delete blog.');
    }
  };

  const renderBlogCard = (blog: Blog, isDraft: boolean = false) => (
    <div
      key={blog._id}
      onClick={() => handleSelect(blog)}
      onDoubleClick={() => handleDoubleClick(blog)}
      style={{
        cursor: 'pointer',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '8px',
        border: '1px solid #ccc',
        backgroundColor:
          selectedBlogId === blog._id
            ? isDraft
              ? '#fffde7'
              : '#fff8e1'
            : isDraft
            ? '#fff3e0'
            : '#e3f2fd',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        color: 'black',
      }}
      title="Click to edit, double click to view, Refresh to See Published Works"
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ flex: '1 1 70%' }}>
        <strong>{blog.title}</strong> — <em>{formatDate(blog.updated_at)}</em>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(blog._id);
        }}
        style={{
          backgroundColor: '#e53935',
          border: 'none',
          color: 'black',
          padding: '5px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e53935')}
        aria-label={`Delete blog titled ${blog.title}`}
      >
        Delete
      </button>
    </div>
  );

  return (
    <div style={{ padding: '1rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>📜 All Blogs</h1>
      <h3 style={{ textAlign: 'center' }}>Click to Edit • Double Click to Preview • Refresh to update Blog</h3>
      <h3 style={{ textAlign: 'center' }}>Wait 5 seconds to Load Database</h3>

      {/* Published */}
      <section>
        <h3 style={{ color: 'gold' }}>✅ Published</h3>
        {blogs.filter((b) => b.status === 'published').map((blog) => renderBlogCard(blog))}
      </section>

      {/* Drafts */}
      <section>
        <h3 style={{ color: '#f57f17' }}>📝 Drafts</h3>
        {blogs.filter((b) => b.status === 'draft').map((blog) => renderBlogCard(blog, true))}
      </section>

      {/* Modal */}
      {viewBlog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            opacity: modalVisible ? 1 : 0,
            pointerEvents: modalVisible ? 'auto' : 'none',
            transition: 'opacity 300ms ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 8,
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transform: modalVisible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'transform 300ms ease',
              color: 'black',
            }}
          >
            <h2 id="modal-title">{viewBlog.title}</h2>
            <p>
              <strong>Status:</strong>{' '}
              <span style={{ textTransform: 'capitalize' }}>{viewBlog.status}</span>
            </p>
            <hr />
            <div
              dangerouslySetInnerHTML={{ __html: viewBlog.content }}
              style={{ whiteSpace: 'pre-wrap', color: '#333' }}
            />
            <button
              onClick={closeModal}
              style={{
                marginTop: 20,
                backgroundColor: '#1976d2',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Developer Credits */}
      <footer
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#ccc',
          fontSize: '0.9rem',
        }}
      >
        Developed by{' '}
        <a
          href="https://www.linkedin.com/in/yuvanesh-v-78730b32a"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#90caf9', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Yuvanesh V
        </a>
      </footer>
    </div>
  );
};

export default BlogList;
