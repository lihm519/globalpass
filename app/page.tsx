// Force dynamic rendering (disable static generation)
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', color: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>GlobalPass</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Global E-SIM Price Comparison</p>
      <p>Find the best international data plans with GlobalPass.</p>
      <p style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.7 }}>
        Impact verification: ee6eb054-80e6-4184-9cb0-f2336e37b8ad
      </p>
    </div>
  );
}
