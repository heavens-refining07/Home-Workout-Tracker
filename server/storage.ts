import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';

if(process.env.NODE_ENV==='production' && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in production.');
const pool=process.env.DATABASE_URL ? new pg.Pool({connectionString:process.env.DATABASE_URL,max:5}) : null;
const localPath=resolve(process.env.LOCAL_DB_PATH || '.data/fittracker.sqlite');
if(!pool) mkdirSync(dirname(localPath),{recursive:true});
const sqlite=pool ? null : new DatabaseSync(localPath);
if(sqlite) sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
const connections=new AsyncLocalStorage<any>();
export async function query(sql:string,params:any[]=[]):Promise<any[]> {
  if(pool){let i=0;return (await (connections.getStore() || pool).query(sql.replace(/\?/g,()=>`$${++i}`),params)).rows;}
  const statement=sqlite!.prepare(sql);
  if(/^\s*(SELECT|INSERT.*RETURNING|UPDATE.*RETURNING|DELETE.*RETURNING)/is.test(sql)) return statement.all(...params);
  statement.run(...params);return [];
}
let queue=Promise.resolve();
export async function transaction<T>(fn:()=>Promise<T>):Promise<T>{
  if(pool){const client=await pool.connect();try {await client.query('BEGIN');const value=await connections.run(client,fn);await client.query('COMMIT');return value;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
  const previous=queue;let release!:()=>void;queue=new Promise<void>(r=>release=r);await previous;
  sqlite!.exec('BEGIN');try {const value=await fn();sqlite!.exec('COMMIT');return value;}catch(e){sqlite!.exec('ROLLBACK');throw e;}finally{release();}
}
export async function initialize(){
  await query('CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY)');
  await query('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, data TEXT NOT NULL)');
  await query('CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires BIGINT NOT NULL)');
  await query('CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, table_name TEXT NOT NULL, owner TEXT NOT NULL, data TEXT NOT NULL, created TEXT NOT NULL)');
  await query('CREATE INDEX IF NOT EXISTS records_scope ON records(table_name,owner,created)');
  await query('CREATE UNIQUE INDEX IF NOT EXISTS profiles_owner ON records(owner) WHERE table_name = \'Profiles\'');
}
