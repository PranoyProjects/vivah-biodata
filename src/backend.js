// Supabase backend: auth (email magic link) + Postgres tables protected by Row Level Security.
// Tables: profiles (public to signed-in users), saved + contacts (private to owner). See supabase/schema.sql.
import {useState,useEffect,useCallback,useRef} from 'react';
import {createClient} from '@supabase/supabase-js';

const URL=import.meta.env.VITE_SUPABASE_URL;
const KEY=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase=URL&&KEY?createClient(URL,KEY,{auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,flowType:"pkce"}}):null;
if(!supabase){
  console.error('⚠️ Vivah: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Check .env.local');
  if(import.meta.env.DEV){
    const b=document.createElement('div');
    b.setAttribute('style','position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:9999;font-family:monospace;box-shadow:0 4px 12px rgba(0,0,0,.3)');
    b.textContent='⚠️ Supabase not configured — check .env.local';
    document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(b));
  }
}

const CONTACT_KEYS=['contactName','contactPhone','contactEmail','phonePrivacy','emailPrivacy','photoPref'];

export function useBackend(){
  const [session,setSession]=useState(null);
  const [ready,setReady]=useState(false);
  const [members,setMembers]=useState([]);
  const [saved,setSaved]=useState({all:[],collections:[]});
  const [contact,setContact]=useState(null);
  const q=useRef(Promise.resolve());
  const uid=session?.user?.id||null;

  // Auth state
  useEffect(()=>{
    if(!supabase){setReady(true);return;}
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true);});
    const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return()=>sub.subscription.unsubscribe();
  },[]);

  const loadMembers=useCallback(async()=>{
    if(!supabase||!uid){setMembers([]);return;}
    const {data,error}=await supabase.from('profiles').select('user_id,data,updated_at');
    if(error){console.warn(error);return;}
    setMembers(data.map(r=>({...r.data,_uid:r.user_id,updatedAt:Date.parse(r.updated_at)})));
  },[uid]);

  // Per-user data
  useEffect(()=>{
    loadMembers();
    if(!supabase||!uid){setSaved({all:[],collections:[]});setContact(null);return;}
    supabase.from('saved').select('data').eq('user_id',uid).maybeSingle()
      .then(({data})=>data&&setSaved({all:data.data.all||[],collections:data.data.collections||[]}));
    supabase.from('contacts').select('data').eq('user_id',uid).maybeSingle()
      .then(({data})=>setContact(data?data.data:null));
  },[uid,loadMembers]);

  // Serialize writes so rapid clicks don't race
  const enqueue=fn=>(q.current=q.current.then(fn,fn));
  const must=({error})=>{if(error)throw error;};

  const savedRef=useRef(saved);
  savedRef.current=saved;
  const writeSaved=useCallback(next=>{
    const prev=savedRef.current;
    setSaved(next);
    if(!supabase||!uid)return Promise.resolve();
    return enqueue(async()=>{
      const{error}=await supabase.from('saved').upsert({user_id:uid,data:next});
      if(error){setSaved(prev);throw error;}
    });
  },[uid]);

  const saveProfile=useCallback(async d=>{
    if(!supabase||!uid)throw new Error('signed_out');
    const pub={},priv={};
    Object.entries(d).forEach(([k,v])=>{if(v!==undefined)(CONTACT_KEYS.includes(k)?priv:pub)[k]=v;});
    await enqueue(async()=>must(await supabase.from('profiles').upsert({user_id:uid,data:pub,updated_at:new Date().toISOString()})));
    await enqueue(async()=>must(await supabase.from('contacts').upsert({user_id:uid,data:priv})));
    setContact(priv);
    await loadMembers();
  },[uid,loadMembers]);

  const deleteProfile=useCallback(async()=>{
    if(!supabase||!uid)return;
    await enqueue(async()=>must(await supabase.from('profiles').delete().eq('user_id',uid)));
    await loadMembers();
  },[uid,loadMembers]);

  const signIn=useCallback(async email=>{
    if(!supabase)throw new Error('not_configured');
    const {error}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true}});
    if(error)throw error;
  },[]);
  const verifyOtp=useCallback(async(email,token)=>{
    if(!supabase)throw new Error('not_configured');
    const {error}=await supabase.auth.verifyOtp({email,token,type:'email'});
    if(error)throw error;
  },[]);
  const signOut=useCallback(()=>supabase&&supabase.auth.signOut(),[]);

  const email=session?.user?.email||'';
  const me=uid?{id:uid,email,name:email.split('@')[0]}:null;
  const uploadPhoto=useCallback(async(file)=>{
    if(!supabase||!uid)throw new Error('signed_out');
    const ext=file.name.split('.').pop().toLowerCase()||'jpg';
    const path=`${uid}/avatar.${ext}`;
    const{error}=await supabase.storage.from('avatars').upload(path,file,{upsert:true,contentType:file.type});
    if(error)throw error;
    const{data}=supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl+'?t='+Date.now();
  },[uid]);

  const deletePhoto=useCallback(async(photoUrl)=>{
    if(!supabase||!uid||!photoUrl)return;
    const path=photoUrl.split('/avatars/')[1]?.split('?')[0];
    if(path)await supabase.storage.from('avatars').remove([path]);
  },[uid]);

  const myRaw=members.find(m=>m._uid===uid)||null;
  return {ready,configured:!!supabase,uid,me,loggedIn:!!uid,members,saved,contact,myRaw,writeSaved,saveProfile,deleteProfile,uploadPhoto,deletePhoto,signIn,verifyOtp,signOut};
}
