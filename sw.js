const C="mirqaam-v9",F=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const c=n.clone();caches.open(C).then(x=>x.put(e.request,c));return n}).catch(()=>caches.match("./index.html"))))});

const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open("mirqaam",1);r.onupgradeneeded=()=>{const d=r.result;["files","sched","fired"].forEach(n=>d.createObjectStore(n,n=="files"?{keyPath:"id",autoIncrement:true}:{keyPath:"id"}))};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}),
tx=(s,m,f)=>idb().then(d=>new Promise((res,rej)=>{const t=d.transaction(s,m),r=f(t.objectStore(s));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)}));
async function due(){try{const n=Date.now(),L=(await tx("sched","readonly",o=>o.getAll()))||[],F=new Set((await tx("fired","readonly",o=>o.getAllKeys()))||[]);for(const x of L){if(n>=x.t&&n-x.t<12e5&&!F.has(x.id)){await self.registration.showNotification(x.title,{body:x.body,icon:"icon-192.png",badge:"icon-192.png",dir:"rtl",lang:"ar",vibrate:[200,100,200],tag:x.id,data:{url:"./"},actions:[{action:"open",title:"فتح مِرقَام"}]});await tx("fired","readwrite",o=>o.put({id:x.id,t:n}))}}}catch(e){}}
self.addEventListener("periodicsync",e=>{if(e.tag=="mirqaam-check")e.waitUntil(due())});
self.addEventListener("message",e=>{if(e.data=="check")e.waitUntil(due())});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window"}).then(c=>c.length?c[0].focus():clients.openWindow("./")))});
