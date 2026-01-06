function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {statusCode || 'Error'}
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          {statusCode === 404 ? 'Page not found' : 'An error occurred'}
        </p>
        <a href="/" style={{ padding: '0.75rem 1.5rem', background: '#10b981', borderRadius: '0.5rem', textDecoration: 'none', color: 'white' }}>
          Go Home
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
