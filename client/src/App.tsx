import { useState } from 'react';
import Editor from './components/Editor';
import BlogList from './components/BlogList';
import type{ Blog } from '../src/types';  // import from central type file

function App() {
  const [editBlog, setEditBlog] = useState<Blog | null>(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>📝 Blog Editor</h1>

      <Editor blogToEdit={editBlog} onSave={() => setEditBlog(null)} />

      <hr style={{ margin: '40px 0' }} />

      <BlogList onEdit={setEditBlog} />
    </div>
  );
}

export default App;
