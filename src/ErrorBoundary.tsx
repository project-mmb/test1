import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    info: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error in React tree:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-6">
              The app encountered an unexpected error while loading. Check the browser console for details.
            </p>
            {this.state.error && (
              <details className="text-left whitespace-pre-wrap text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <div>{this.state.error.toString()}</div>
                {this.state.info?.componentStack && (
                  <pre className="mt-2">{this.state.info.componentStack}</pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
