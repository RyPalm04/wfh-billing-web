import './ErrorFallback.css'

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="error-fallback">
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Please try again later.</p>
            <button onClick={resetErrorBoundary} className="btn btn-primary">Try again</button>
        </div>
    )
}

export default ErrorFallback;