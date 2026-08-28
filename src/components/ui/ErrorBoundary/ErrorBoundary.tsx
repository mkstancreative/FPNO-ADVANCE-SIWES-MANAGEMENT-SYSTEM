import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onReset?: () => void;
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
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(
            this.state.error || new Error("Unknown error"),
            this.handleReset,
          );
        }
        return this.props.fallback;
      }

      return (
        <div className="eb-container">
          <div className="eb-card">
            <div className="eb-icon-wrap">
              <AlertTriangle size={24} className="eb-icon" />
            </div>
            <h3 className="eb-title">Something went wrong</h3>
            <p className="eb-message">
              An unexpected error occurred in this component.
            </p>
            {this.state.error && (
              <pre className="eb-details">{this.state.error.message}</pre>
            )}
            <button
              type="button"
              className="eb-reset-btn"
              onClick={this.handleReset}
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
          <style>{`
            .eb-container {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              width: 100%;
            }
            .eb-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 28px 24px;
              border-radius: 12px;
              background: var(--color-bg-secondary, #f8fafc);
              border: 1px solid var(--color-border, #e2e8f0);
              max-width: 440px;
              width: 100%;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .eb-icon-wrap {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: #fee2e2;
              color: #ef4444;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 14px;
            }
            .eb-title {
              margin: 0 0 6px;
              font-size: 16px;
              font-weight: 700;
              color: var(--color-text-primary, #0f172a);
            }
            .eb-message {
              margin: 0 0 12px;
              font-size: 13px;
              color: var(--color-text-muted, #64748b);
              line-height: 1.5;
            }
            .eb-details {
              margin: 0 0 16px;
              padding: 8px 12px;
              border-radius: 6px;
              background: rgba(0, 0, 0, 0.04);
              font-size: 11.5px;
              color: #dc2626;
              max-width: 100%;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
              font-family: monospace;
            }
            .eb-reset-btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 8px 16px;
              font-size: 13px;
              font-weight: 600;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              background: var(--color-accent, #2563eb);
              color: #ffffff;
              transition: opacity 0.15s;
            }
            .eb-reset-btn:hover {
              opacity: 0.9;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
