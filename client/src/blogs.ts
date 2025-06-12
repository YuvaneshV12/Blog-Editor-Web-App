// blogs.ts
import type { Blog } from './types'; // use the centralized type

export const blogs: Blog[] = [
  {
    _id: '1',
    title: 'Sample Blog 1',
    content: '<p>Content for blog 1</p>',
    tags: ['sample', 'demo'],
    status: 'published',
    updated_at: '2025-05-18T10:00:00Z',
  },
  {
    _id: '2',
    title: 'Sample Blog 2',
    content: '<p>Content for blog 2</p>',
    tags: ['draft'],
    status: 'draft',
    updated_at: '2025-05-17T15:00:00Z',
  },
];
