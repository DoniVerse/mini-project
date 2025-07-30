import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('/api/posts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to fetch posts');
          if (res.status === 401) router.push('/login');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Posts</h2>
      <button onClick={handleLogout}>Logout</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: 20, border: '1px solid #ccc', padding: 10 }}>
            <div><b>{post.users.username}</b> ({post.users.email})</div>
            <div>{post.content}</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>Posted: {new Date(post.created_at).toLocaleString()}</div>
            <div>
              <b>Comments:</b>
              <ul>
                {post.comments.map((c) => (
                  <li key={c.id}>
                    <b>{c.users.username}:</b> {c.content}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 