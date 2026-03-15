import devtoolsJson from 'vite-plugin-devtools-json';
import { ngrok } from "vite-plugin-ngrok";
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

const { NGROK_AUTH_TOKEN } = loadEnv('', process.cwd(), 'NGROK')

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    devtoolsJson(),
    ngrok({
      authtoken: NGROK_AUTH_TOKEN,
    }),
  ]
});
