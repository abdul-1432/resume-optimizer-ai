import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This base can be overridden during CI build step with --base option.
  base: '/',
})
    port: 5173
  }
});
