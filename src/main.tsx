import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enhanced error logging for production debugging
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});

// Log environment check
console.log('🚀 Initializing Fusion...');
console.log('Environment check:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD
});

// Render app
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element '#root' not found in DOM");
  }
  
  console.log('✓ Root element found, mounting React app...');
  createRoot(rootElement).render(<App />);
  console.log('✓ React app mounted successfully');
  
} catch (error) {
  console.error('❌ Failed to initialize app:', error);
  
  // Show detailed error UI
  const errorHtml = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: system-ui; padding: 20px;">
      <div style="max-width: 600px; background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 1rem; backdrop-filter: blur(10px);">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Application Error</h1>
        <p style="margin-bottom: 1rem; opacity: 0.9;">The application failed to initialize. This usually means:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem; opacity: 0.9;">
          <li>Environment variables are not set in Netlify</li>
          <li>Build failed to complete properly</li>
          <li>JavaScript bundle failed to load</li>
        </ul>
        <button onclick="window.location.reload()" style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; margin-right: 1rem;">
          Refresh Page
        </button>
        <button onclick="window.location.href='/env-check.html'" style="background: rgba(255,255,255,0.2); color: white; padding: 0.75rem 1.5rem; border: 1px solid white; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          Check Environment
        </button>
        <details style="margin-top: 2rem; opacity: 0.9;">
          <summary style="cursor: pointer; margin-bottom: 1rem;">Technical Details</summary>
          <pre style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 0.5rem; overflow: auto; font-size: 0.875rem; white-space: pre-wrap; word-break: break-word;">${error instanceof Error ? `${error.name}: ${error.message}\n\nStack:\n${error.stack}` : String(error)}</pre>
        </details>
      </div>
    </div>
  `;
  
  document.body.innerHTML = errorHtml;
}
