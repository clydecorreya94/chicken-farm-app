import { Component } from "react";

// Catches render-time errors so a bug shows a reload card instead of a
// white screen (localStorage data is untouched by render errors).
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Farm Manager render error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", background: "#0a0500", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,83,80,0.3)", borderRadius: 18, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🤕</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#EF9A9A", marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 16 }}>
            The app hit an unexpected error. Your farm data is safe in this device's storage — reloading usually fixes it.
          </div>
          <button onClick={() => window.location.reload()} style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#E87722,#BF5500)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Reload App
          </button>
          <details style={{ marginTop: 14, textAlign: "left" }}>
            <summary style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>Technical details</summary>
            <pre style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", whiteSpace: "pre-wrap", marginTop: 6 }}>{String(this.state.error)}</pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
