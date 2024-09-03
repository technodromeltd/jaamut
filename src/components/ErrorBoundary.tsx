import React, { Component, ErrorInfo, ReactNode } from "react";
import { HiOutlineEmojiSad } from "react-icons/hi";
import { Link } from "react-router-dom";
import Button from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary-bg text-primary-text p-4 text-center">
          <HiOutlineEmojiSad className="text-6xl mb-4" />
          <h1 className="text-3xl font-bold mb-4">Oops! Got an error</h1>
          <p className="text-xl mb-8">Try refreshing the page.</p>
          <Link to="/">
            <Button variant="primary">Reload</Button>
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
