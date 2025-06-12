import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import debounce from 'lodash/debounce';
import { toast, ToastContainer } from 'react-toastify';
import 'react-quill/dist/quill.snow.css';
import 'react-toastify/dist/ReactToastify.css';
import type { Blog } from '../types';

type EditorProps = {
  blogToEdit?: Blog | null;
  onSave: () => void;
};

const Editor: React.FC<EditorProps> = ({ blogToEdit, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (blogToEdit) {
      setTitle(blogToEdit.title);
      setContent(blogToEdit.content);
      setTags(blogToEdit.tags.join(', '));
      setId(blogToEdit._id || null);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setId(null);
    }
  }, [blogToEdit]);

  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      const res = await axios.post('https://blogs-6tlu.onrender.com/api/blogs/save-draft', {
        id,
        title,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      if (res.data._id) setId(res.data._id);
      toast.success('Auto-saved!', { autoClose: 1000 });
      onSave();
    } catch (err) {
      toast.error('Auto-save failed!');
    }
  }, [title, content, tags, id, onSave]);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Debounce auto-save on changes with cleanup
  const debouncedAutoSave = useCallback(debounce(() => {
    autoSave();
  }, 5000), [autoSave]);

  useEffect(() => {
    debouncedAutoSave();
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [title, content, tags, debouncedAutoSave]);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      await axios.post('https://blogs-6tlu.onrender.com/api/blogs/publish', {
        id,
        title,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast.success('Published!');
      setId(null);
      setTitle('');
      setContent('');
      setTags('');
      onSave();
    } catch {
      toast.error('Failed to publish.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '90%',
    padding: '10px',
    marginBottom: '10px',
    fontSize: '18px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <style>{`.ql-editor { color: #000 !important; }`}</style>

      <div
        style={{
          padding: '20px',
          borderRadius: '12px',
          background: '#f9f9f9',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.3)')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
        />

        <ReactQuill value={content} onChange={setContent} />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          style={{ ...inputStyle, marginTop: '10px' }}
          onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.3)')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
        />

        <div style={{ marginTop: 20 }}>
          <button
            onClick={handlePublish}
            style={buttonStyle}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            Publish
          </button>
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default Editor;
