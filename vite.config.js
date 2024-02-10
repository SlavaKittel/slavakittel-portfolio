import react from '@vitejs/plugin-react'

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
    plugins:
    [
        react()
    ],
    root: 'src/',
    publicDir: "../public/",
    base: './',
    server:
    {
        port: 8000,
        host: true,
        open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../build',
        emptyOutDir: true,
        sourcemap: true
    }
}