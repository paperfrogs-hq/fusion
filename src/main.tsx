import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Safely render app with error handling
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Failed to initialize app:', error);
  
  // Fallback UI
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; color: white; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Application Error</h1>
        <p style="color: #94a3b8; margin-bottom: 2rem;">The application failed to load. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
          Refresh Page
        </button>
        <details style="margin-top: 2rem; text-align: left; max-width: 600px;">
          <summary style="cursor: pointer; color: #94a3b8;">Technical Details</summary>
          <pre style="background: #1e293b; padding: 1rem; border-radius: 0.5rem; overflow: auto; margin-top: 1rem; font-size: 0.875rem;">${error instanceof Error ? error.message + '\n\n' + error.stack : String(error)}</pre>
        </details>
      </div>
    </div>
  `;
}
