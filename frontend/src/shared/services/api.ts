import axios from 'axios';

const environment = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

// Use Vite-provided env var `VITE_API_URL`. When not set (e.g. proxying in dev),
// fall back to a relative `/api` base so the app continues to work without exposing hosts.
const baseURL = environment?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 10000,
});
