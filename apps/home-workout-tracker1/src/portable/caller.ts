export function createCaller<I,O>(name:string){return async(input:I):Promise<O>=>{
  const response=await fetch(`/api/${name}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),credentials:'same-origin'});
  const body=await response.json();
  if(!response.ok) throw new Error(body.error || 'Request failed');
  return body;
};}
