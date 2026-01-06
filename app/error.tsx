"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Error() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Error</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Something went wrong</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '0.75rem 1.5rem', background: '#10b981', borderRadius: '0.5rem', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
