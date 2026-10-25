import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const defaultBase = env.VITE_OMNIROUTE_BASE_URL || 'http://localhost:20128/v1';

  let defaultOrigin = 'http://localhost:20128';
  try {
    defaultOrigin = new URL(defaultBase).origin;
  } catch (e) {}

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api-proxy': {
          target: defaultOrigin,
          changeOrigin: true,
          secure: false,
          router: (req) => {
            const customOrigin = req.headers['x-target-origin'];
            if (customOrigin) {
              return customOrigin;
            }
            return defaultOrigin;
          },
          rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        },
      },
    },
  };
});

