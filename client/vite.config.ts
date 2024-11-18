import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    define: {
        'process.env': {
          REACT_APP_AMP_SERVER: process.env.REACT_APP_AMP_SERVER,
        },
    },
    server: {
        port: 3006,
    },
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, 'src/lib/index.ts'),
            name: 'MyLib',
            formats: ['es', 'umd'],
            fileName: (format) => `my-lib.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                },
            },
        },
    },
});
