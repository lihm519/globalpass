// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Page not found</p>
        <a href="/" style={{ padding: '0.75rem 1.5rem', background: '#10b981', borderRadius: '0.5rem', textDecoration: 'none', color: 'white' }}>
          Go Home
        </a>
      </div>
    </div>
  );
}
