// Minimal error page to avoid webpack runtime issues
function Error({ statusCode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
          {statusCode || 'Error'}
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
          {statusCode === 404 ? 'Page Not Found' : 'Something went wrong'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          {statusCode === 404 
            ? 'The page you are looking for does not exist.' 
            : 'An error occurred while processing your request.'
          }
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500'
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
