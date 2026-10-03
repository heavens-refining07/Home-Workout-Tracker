import express from 'express';
import rateLimit from 'express-rate-limit';
import {randomUUID,randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import path from 'node:path';
import {z} from 'zod';
import {initialize,query,transaction} from './storage';
import {actors} from './runtime';
import {endpoints} from './endpoints';
import {seedExercises} from './starterExercises';
const scrypt=promisify(scryptCallback);
const production=process.env.NODE_ENV==='production';
const adminEmails=new Set((process.env.ADMIN_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean));
const app=express();app.disable('x-powered-by');app.set('trust proxy',1);
app.use(express.json({limit:'100kb'}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');if(req.path.startsWith('/api'))res.setHeader('Cache-Control','no-store');if(req.method==='POST' && req.headers.origin){const origin=new URL(req.headers.origin);if(origin.host!==req.headers.host){return res.status(403).json({error:'Request origin not allowed'});}}next();});
const cookieName=production?'__Host-fittracker':'fittracker';
const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
async function userFor(req:any){const token=req.headers.cookie?.split(';').map((s:string)=>s.trim()).find((s:string)=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!token)return null;const rows=await query('SELECT u.data FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ?',[tokenHash(token),Date.now()]);return rows[0]?JSON.parse(rows[0].data):null;}
async function createSession(res:any,user:any){const token=randomBytes(32).toString('hex');await query('DELETE FROM sessions WHERE expires < ?',[Date.now()]);await query('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)',[tokenHash(token),user.id,Date.now()+7*86400000]);res.cookie(cookieName,token,{httpOnly:true,secure:production,sameSite:'lax',maxAge:7*86400000,path:'/'});}
const wrap=(handler:any)=>(req:any,res:any,next:any)=>Promise.resolve(handler(req,res)).catch(next);
const authLimit=rateLimit({windowMs:60*60*1000,limit:30,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many login attempts. Try again later.'}});
const credentials=z.object({email:z.string().email().max(254).transform(e=>e.toLowerCase().trim()),password:z.string().min(1).max(256)});
app.get('/api/health',wrap(async(_req:any,res:any)=>{await query('SELECT 1');res.json({ok:true});}));
app.get('/api/auth/me',wrap(async(req:any,res:any)=>res.json({user:await userFor(req)})));
app.post('/api/auth/register',authLimit,wrap(async(req:any,res:any)=>{
  const input=credentials.extend({name:z.string().trim().min(1).max(100),password:z.string().min(10).max(256)}).parse(req.body);
  const salt=randomBytes(16).toString('hex');const key=await scrypt(input.password,salt,64) as Buffer;
  const user={id:randomUUID(),email:input.email,name:input.name,firstName:input.name.split(' ')[0],lastName:input.name.split(' ').slice(1).join(' '),image:null,createdAt:new Date().toISOString()};
  await transaction(async()=>{if((await query('SELECT id FROM users WHERE email = ?',[input.email])).length)throw Object.assign(new Error('Unable to create account with this email'),{status:409});await query('INSERT INTO users(id,email,password,data) VALUES(?,?,?,?)',[user.id,input.email,`${salt}:${key.toString('hex')}`,JSON.stringify(user)]);const profile={id:`profile-${user.id}`,user:user.id,displayName:user.name,role:adminEmails.has(user.email)?'Admin':'User',fitnessLevel:'Beginner',fitnessGoal:'General Fitness',createdAt:user.createdAt};await query('INSERT INTO records(id,table_name,owner,data,created) VALUES(?,?,?,?,?)',[profile.id,'Profiles',user.id,JSON.stringify(profile),user.createdAt]);await createSession(res,user);});
  res.status(201).json({user});
}));
app.post('/api/auth/login',authLimit,wrap(async(req:any,res:any)=>{
  const input=credentials.parse(req.body);const account=(await query('SELECT password,data FROM users WHERE email = ?',[input.email]))[0];
  const [salt,hash]=(account?.password || '00000000000000000000000000000000:'+ '00'.repeat(64)).split(':');const key=await scrypt(input.password,salt,64) as Buffer;
  if(!account || !timingSafeEqual(key,Buffer.from(hash,'hex')))return res.status(401).json({error:'Invalid email or password'});
  const user=JSON.parse(account.data);await createSession(res,user);res.json({user});
}));
app.post('/api/auth/logout',wrap(async(req:any,res:any)=>{const token=req.headers.cookie?.split(';').map((s:string)=>s.trim()).find((s:string)=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(token)await query('DELETE FROM sessions WHERE token = ?',[tokenHash(token)]);res.clearCookie(cookieName,{path:'/',secure:production,httpOnly:true,sameSite:'lax'});res.json({success:true});}));
app.use('/api',rateLimit({windowMs:60*1000,limit:300,standardHeaders:'draft-7',legacyHeaders:false}));
app.post('/api/:name',wrap(async(req:any,res:any)=>{
  const endpoint=(endpoints as any)[req.params.name];if(!endpoint || !Object.hasOwn(endpoints,req.params.name))return res.status(404).json({error:'Endpoint not found'});
  const user=await userFor(req);if(!user)return res.status(401).json({error:'Please log in'});
  const input=endpoint.inputSchema.parse(req.body||{});const admin=adminEmails.has(user.email);
  const output=await transaction(()=>actors.run({user,admin,readAll:admin && req.params.name==='getAdmin'},async()=>{
    // Admin privileges come from deployment configuration, never browser input.
    const p=(await query('SELECT id,data FROM records WHERE table_name = ? AND owner = ?',['Profiles',user.id]))[0];
    if(p){const profile=JSON.parse(p.data);const role=admin?'Admin':'User';if(profile.role!==role)await query('UPDATE records SET data = ? WHERE id = ?',[JSON.stringify({...profile,role}),p.id]);}
    return endpoint.execute({input,context:{user}});
  }));res.json(output);
}));
app.use('/api',(_req,res)=>res.status(404).json({error:'Not found'}));
app.use(express.static(path.resolve('dist')));
app.get('*',(_req,res)=>res.sendFile(path.resolve('dist/index.html')));
app.use((error:any,_req:any,res:any,_next:any)=>{const status=error instanceof z.ZodError?400:error.status || (error.message?.startsWith('Unauthorized')?403:500);if(status===500)console.error(error);res.status(status).json({error:status===500?'Unable to complete this request':error instanceof z.ZodError?'Please check the supplied values':error.message});});
await initialize();
await seedExercises();
const server=app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log(`FitTracker ready on port ${process.env.PORT||3000}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
