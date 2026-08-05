import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
          <img
            src="/assets/betryd.png"
            alt="Betryd Logo"
            className="w-32 h-auto opacity-90 mb-4 transition-opacity duration-300"
            style={{ filter: 'brightness(0)' }}
          />
          <p className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
            Interactive view unavailable
          </p>
          {this.state.error && (
            <pre className="mt-2 text-[10px] text-rose-500 font-mono max-w-xs overflow-x-auto bg-neutral-50 p-2 border border-neutral-100 rounded">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
