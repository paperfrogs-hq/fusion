import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Render app
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element '#root' not found in DOM");
  }

  createRoot(rootElement).render(<App />);

} catch (error) {
  console.error('Failed to initialize app:', error);

  // Show a generic fallback. Do not render the raw error message or
  // stack trace, those can leak environment paths, table names, and
  // internal details to anyone who hits the page during a bad deploy.
  const fallbackHtml = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0B0D0B; color: #F4EFE6; font-family: ui-sans-serif, system-ui, sans-serif; padding: 20px;">
      <div style="max-width: 520px; text-align: left;">
        <p style="font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.6; margin-bottom: 1.25rem;">Fusion</p>
        <h1 style="font-family: Georgia, serif; font-weight: 300; font-size: 2.25rem; line-height: 1.1; margin-bottom: 1rem;">Something went sideways on launch.</h1>
        <p style="opacity: 0.8; margin-bottom: 1.75rem;">The app failed to initialize. A refresh usually clears it. If it does not, the studio has been notified.</p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="background: #B6FF00; color: #0B0D0B; padding: 0.75rem 1.5rem; border: none; border-radius: 9999px; cursor: pointer; font-weight: 600;">Refresh page</button>
          <a href="mailto:hello@paperfrogs.dev" style="background: transparent; color: #F4EFE6; padding: 0.75rem 1.5rem; border: 1px solid rgba(244,239,230,0.3); border-radius: 9999px; cursor: pointer; font-weight: 500; text-decoration: none;">Email the studio</a>
        </div>
      </div>
    </div>
  `;

  document.body.innerHTML = fallbackHtml;
}
