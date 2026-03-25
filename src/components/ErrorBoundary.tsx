import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }

      let errorMessage = 'An unexpected error occurred.';
      try {
        // Check if it's a Firestore error JSON
        const parsedError = JSON.parse(error?.message || '');
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-950 p-6 text-center">
          <div className="bg-indigo-900 bg-opacity-50 backdrop-blur-md p-8 rounded-2xl border border-red-500 shadow-2xl max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4">Oops!</h2>
            <p className="text-indigo-200 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
