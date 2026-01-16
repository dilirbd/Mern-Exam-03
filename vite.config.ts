// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {

  // const env = loadEnv(mode, process.cwd());

  // console.log('Loaded env vars: ', Object.keys(env).filter(k => k.startsWith('VITE_')));

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
    ],
    server: {
      open: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
}
)
