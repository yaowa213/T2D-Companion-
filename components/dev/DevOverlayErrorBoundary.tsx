
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class DevOverlayErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dev Overlay Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#ef4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 2147483647,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          DEV TOOLS CRASHED
        </div>
      );
    }

    // Fix: In React class components, children must be accessed via this.props
    return this.props.children;
  }
}
