import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
const here=path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({root:here,plugins:[react()],resolve:{dedupe:['react','react-dom'],alias:{'@':path.join(here,'src'),'@project/components':path.resolve(here,'../../packages/components'),'zitejs/auth':path.join(here,'src/portable/auth.ts'),'zitejs/api':path.join(here,'.zite/api.ts'),'zitejs/caller':path.join(here,'src/portable/caller.ts')}},server:{host:'127.0.0.1',port:5173,proxy:{'/api':'http://127.0.0.1:3000'}},build:{outDir:path.resolve(here,'../../dist'),emptyOutDir:true}});
