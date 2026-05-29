import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/components/ui/ErrorState';

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  /** Cambia al abrir otro producto para resetear el boundary. */
  resetKey?: string;
  onReset?: () => void;
};

type State = { error: Error | null };

export class ShopProductFormErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ShopProductForm]', error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="p-6">
          <ErrorState
            title={this.props.title ?? 'No se pudo abrir el producto'}
            description={
              this.props.description ??
              'Hay datos incompletos o inválidos en este producto. Cerrá el modal e intentá de nuevo.'
            }
            onRetry={this.retry}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
