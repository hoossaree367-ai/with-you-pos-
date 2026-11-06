// Real backend: Firebase Auth + Firestore, exposed through the small store interface the POS uses.
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'firebase/auth';
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,doc,setDoc,deleteDoc,getDocs,onSnapshot} from 'firebase/firestore';
const app=initializeApp({
  apiKey:"AIzaSyBUmpQidudM1kgDn-K2w1DQ2WPrEn83aYE",
  authDomain:"with-you-pos.firebaseapp.com",
  projectId:"with-you-pos",
  storageBucket:"with-you-pos.firebasestorage.app",
  messagingSenderId:"954788854031",
  appId:"1:954788854031:web:318b068fadb2bd5c36a67a"
});
const auth=getAuth(app);
const fs=initializeFirestore(app,{ignoreUndefinedProperties:true,localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
const wrapDoc=d=>({id:d.id,exists:d.exists(),data:()=>d.data()});
const wrapQ=s=>({docs:s.docs.map(wrapDoc),size:s.size,metadata:s.metadata});
const docRef=r=>({set:v=>setDoc(r,v),delete:()=>deleteDoc(r),onSnapshot:(n,e)=>onSnapshot(r,{includeMetadataChanges:true},d=>n({...wrapDoc(d),metadata:d.metadata}),e)});
export const db={
  doc:p=>docRef(doc(fs,p)),
  collection:p=>{const c=collection(fs,p);return{doc:id=>docRef(doc(c,id)),get:()=>getDocs(c).then(wrapQ),onSnapshot:(n,e)=>onSnapshot(c,{includeMetadataChanges:true},s=>n(wrapQ(s)),e)}}
};
export const onUser=fn=>onAuthStateChanged(auth,fn);
export const login=(email,pw)=>signInWithEmailAndPassword(auth,email,pw);
export const logout=()=>signOut(auth);
