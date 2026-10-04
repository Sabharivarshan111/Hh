import path from 'node:path';
import config from '../app-source/mobile/preview/vite.config';
// Advertisement preview only: does not modify or ship the app repository.
export default {
 ...config,
 resolve: {...config.resolve, alias: [
  {find: '@/components/Bot', replacement: path.resolve(__dirname, 'integration/BotPreview.tsx')},
  ...config.resolve.alias,
 ]},
 build: {...config.build, outDir: path.resolve(__dirname, 'preview-build')},
};
