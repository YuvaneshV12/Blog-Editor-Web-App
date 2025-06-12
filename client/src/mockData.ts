import type { Blog } from './types';

export const blogs: Blog[] = [
  {
    _id: '1',
    title: 'First blog',
    content: '<p>This is the first blog content.</p>',
    tags: ['tag1', 'tag2'],
    status: 'published',
    updated_at: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Draft blog',
    content: '<p>Draft blog content.</p>',
    tags: ['draft'],
    status: 'draft',
    updated_at: new Date().toISOString(),
  },
];
