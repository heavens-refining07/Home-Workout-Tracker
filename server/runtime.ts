import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { query } from './storage';

export const actors=new AsyncLocalStorage<{user:any; admin:boolean; readAll:boolean}>();
const actor=()=>{const a=actors.getStore();if(!a) throw new Error('Authentication required');return a;};
const forbidden=()=>{throw Object.assign(new Error('Record not found or access denied'),{status:403});};
function match(value:any,selector:any){
  if(selector===undefined) return false;
  if(selector && typeof selector==='object' && !Array.isArray(selector)) return Object.entries(selector).every(([op,want]:any)=>{
    if(op==='contains') return String(value||'').toLowerCase().includes(String(want).toLowerCase());
    if(op==='not') return value!==want;
    if(op==='in') return want.includes(value);
    if(op==='notIn') return !want.includes(value);
    if(op==='lt') return value<want;if(op==='lte') return value<=want;if(op==='gt') return value>want;if(op==='gte') return value>=want;
    return false;
  });
  return Array.isArray(value) ? value.includes(selector) : value===selector;
}
const clean=(record:any)=>Object.fromEntries(Object.entries(record).filter(([k,v])=>v!==undefined && !['id','createdAt','user'].includes(k)));
export function createTableClient<T extends {id:string}, I>(table:string){
  async function rows(){const a=actor();const all=table==='Exercises' || (a.admin && a.readAll);return (await query(`SELECT data FROM records WHERE table_name = ?${all?'':' AND owner = ?'} ORDER BY created DESC,id DESC`,all?[table]:[table,a.user.id])).map(r=>JSON.parse(r.data) as T);}
  async function findOne(params:any={}):Promise<T|undefined>{return (await rows()).find((r:any)=>(!params.id || r.id===params.id) && Object.entries(params.filters||{}).every(([k,v])=>match(r[k],v)));}
  async function assertWritable(id:string){const a=actor();const row=(await query('SELECT owner,data FROM records WHERE id = ? AND table_name = ?',[id,table]))[0];if(!row || (table==='Exercises' ? !a.admin : row.owner!==a.user.id)) forbidden();return JSON.parse(row.data);}
  async function create({record}:{record:I}):Promise<T>{
    const a=actor();if(table==='Exercises' && !a.admin) forbidden();
    const createdAt=new Date().toISOString();const id=table==='Profiles' ? `profile-${a.user.id}` : randomUUID();
    const data:any={...clean(record),id,createdAt,...(table==='Exercises'?{}:{user:a.user.id})};
    if(table==='Profiles') data.role=a.admin?'Admin':'User';
    if(table==='ExerciseLogs') {
      const session=(await query('SELECT owner FROM records WHERE id = ? AND table_name = ?',[data.session,'WorkoutSessions']))[0];
      if(session?.owner!==a.user.id) forbidden();
    }
    if(['ExerciseLogs','FavoriteExercises'].includes(table)) {
      const exerciseId=Array.isArray(data.exercise)?data.exercise[0]:data.exercise;
      if(!(await query('SELECT id FROM records WHERE id = ? AND table_name = ?',[exerciseId,'Exercises'])).length) throw Object.assign(new Error('Exercise not found'),{status:400});
    }
    if(table==='WorkoutSessions' && data.plan){const p=(await query('SELECT owner FROM records WHERE id = ? AND table_name = ?',[data.plan,'WorkoutPlans']))[0];if(p?.owner!==a.user.id) forbidden();}
    await query('INSERT INTO records(id,table_name,owner,data,created) VALUES(?,?,?,?,?)',[id,table,table==='Exercises'?'':a.user.id,JSON.stringify(data),createdAt]);return data as T;
  }
  return {
    findOne,
    async findAll(params:any={}):Promise<{records:T[];hasMore:boolean}>{let records=(await rows()).filter((r:any)=>Object.entries(params.filters||{}).every(([k,v])=>match(r[k],v)));const offset=params.offset||0;const limit=Math.min(params.limit||500,2000);return {hasMore:records.length>offset+limit,records:records.slice(offset,offset+limit)};},
    create,
    async update({id,record}:{id:string;record:Partial<I>}){const old=await assertWritable(id);const data={...old,...clean(record)};if(table==='Profiles') data.role=actor().admin?'Admin':'User';await query('UPDATE records SET data = ? WHERE id = ?',[JSON.stringify(data),id]);return {id,fields:data};},
    async delete({id}:{id:string}){await assertWritable(id);await query('DELETE FROM records WHERE id = ?',[id]);return {success:true,id};},
    async bulkCreate({records}:{records:I[]}){const result:T[]=[];for(const record of records) result.push(await create({record}));return {success:true,records:result};}
  };
}
export function createSqlClient(){return async()=>{throw new Error('Raw Zite SQL is not used by this application');};}
export function createAuthClient<T>(){return {async findAllUsers(options:any={}){if(!actor().admin) forbidden();const records=(await query('SELECT data FROM users LIMIT ?',[options.limit||500])).map(r=>JSON.parse(r.data) as T);return {records,total:Number((await query('SELECT COUNT(*) AS total FROM users'))[0].total)};}};}
