import { Component, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'The app hit an unexpected error.'
    };
  }

  componentDidCatch(error: Error) {
    console.error('AppErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="glass-panel-strong w-full max-w-2xl rounded-[32px] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500 dark:text-emerald-300">
              Frontend error
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">
              The screen failed to render.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
