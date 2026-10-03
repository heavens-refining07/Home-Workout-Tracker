import { useEffect,useState } from 'react';
export type User={id:string;email:string;name:string;firstName?:string;lastName?:string;image?:string|null};
let current:User|null=null, loading=true;
const listeners=new Set<()=>void>();
let requested=false;
export function useAuth(){
  const [,refresh]=useState(0);
  useEffect(()=>{const notify=()=>refresh(v=>v+1);listeners.add(notify);if(!requested){requested=true;fetch('/api/auth/me').then(r=>r.json()).then(d=>{current=d.user}).catch(()=>{current=null}).finally(()=>{loading=false;listeners.forEach(fn=>fn())});}return()=>{listeners.delete(notify)};},[]);
  return {user:current,isLoading:loading};
}
export function loginWithRedirect(){const path=window.location.pathname==='/auth'?'/dashboard':window.location.pathname==='/'?'/dashboard':window.location.pathname;window.location.assign(`/auth?next=${encodeURIComponent(path)}`);}
export async function logout(){const r=await fetch('/api/auth/logout',{method:'POST'});if(r.ok) window.location.assign('/');}
