import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/images': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/files': 'http://localhost:3000',
      '/graphql': 'http://localhost:3000',
      '/scoreboard/api': 'http://localhost:3000',
      '/logs': 'http://localhost:3000',
      '/robots.txt': 'http://localhost:3000',
      '/swagger.json': 'http://localhost:3000',
      '/.git': 'http://localhost:3000',
      '/backdoor': 'http://localhost:3000',
      '/profile/preview': 'http://localhost:3000',
    }
  },
  // VULN: V14.1 - Source maps served publicly
  build: {
    sourcemap: true
  }
});
