// Keeps a crashing app inside its own window: the rest of the desktop keeps working.
import { Component, type ReactNode } from "react";

export class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="app-pad">
        <p>This app hit a bug and stopped. Close the window and open it again.</p>
      </div>
    );
  }
}
