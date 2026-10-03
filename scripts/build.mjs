import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import {build as viteBuild} from 'vite';
import viteConfig from '../apps/home-workout-tracker1/vite.config.ts';
await viteBuild({...viteConfig,configFile:false});
const root=process.cwd();
const aliases={'zitejs/backend':'server/endpoint.ts','zitejs/db':'.zite/db.ts','zitejs/runtime':'server/runtime.ts'};
const sources=[...fs.readdirSync('server').filter(f=>f.endsWith('.ts')).map(f=>'server/'+f),'.zite/db.ts',...fs.readdirSync('apps/home-workout-tracker1/src/api').filter(f=>f.endsWith('.ts')).map(f=>'apps/home-workout-tracker1/src/api/'+f)];
for(const source of sources){
  const rewritten=fs.readFileSync(source,'utf8').replace(/(from\s+['"])([^'"]+)(['"])/g,(_,before,specifier,after)=>{
    if(aliases[specifier]){specifier=path.relative(path.dirname(path.resolve(source)),path.resolve(aliases[specifier])).split(path.sep).join('/');if(!specifier.startsWith('.'))specifier='./'+specifier;}
    if(specifier.startsWith('.'))specifier=specifier.endsWith('.ts')?specifier.replace(/\.ts$/,'.js'):specifier.endsWith('.js')?specifier:specifier+'.js';
    return before+specifier+after;
  });
  const output=path.join(root,'server-dist',source.replace(/\.ts$/,'.js'));fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,ts.transpileModule(rewritten,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,verbatimModuleSyntax:false}}).outputText);
}
console.log('Standalone server compiled.');
