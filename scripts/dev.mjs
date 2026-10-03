import {spawn} from 'node:child_process';
import './build.mjs';
import {createServer} from 'vite';
import viteConfig from '../apps/home-workout-tracker1/vite.config.ts';
const backend=spawn(process.execPath,['--env-file-if-exists=.env','server-dist/server/index.js'],{stdio:'inherit'});
const frontend=await createServer({...viteConfig,configFile:false});await frontend.listen();frontend.printUrls();
const stop=()=>{backend.kill();frontend.close()};
process.on('SIGINT',stop);process.on('SIGTERM',stop);
