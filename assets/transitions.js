/* Blend the outgoing and incoming documents directly; never intercept links. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const routes={'/':'home','/academic/':'academic','/academic/note/':'reading','/photography/':'photography','/projects/':'projects','/about/':'about'};
 const policy=document.createElement('style');policy.id='page-transition-policy';document.head.append(policy);
 function readPreference(){try{return localStorage.getItem('rick-motion')!=='off'}catch{return true}}
 let active=null,userEnabled=readPreference();
 function allowed(){return userEnabled&&!reduced.matches&&!document.body?.classList.contains('motion-off')}
 function update(event){
  if(typeof event?.detail==='boolean')userEnabled=event.detail;
  else if(event?.type==='pageshow')userEnabled=readPreference();
  policy.textContent='@view-transition { navigation: '+(allowed()?'auto':'none')+'; }';
  if(!allowed()){active?.skipTransition();active=null}
 }
 function configure(event,outgoing){
  const transition=event.viewTransition;if(!transition)return;
  if(!allowed()){transition.skipTransition();return}
  let destination;
  try{destination=new URL(outgoing?event.activation.entry.url:location.href)}catch{transition.skipTransition();return}
  const kind=routes[destination.pathname];
  if(destination.origin!==location.origin||!kind){transition.skipTransition();return}
  transition.types?.add(kind);document.documentElement.dataset.pageTransition=kind;active=transition;
  if(!outgoing)document.documentElement.dataset.documentArrival='true';
  transition.finished.then(()=>{if(active===transition)active=null},()=>{if(active===transition)active=null});
 }
 update();
 addEventListener('pageswap',event=>configure(event,true));
 addEventListener('pagereveal',event=>configure(event,false));
 addEventListener('pageshow',update);
 reduced.addEventListener('change',update);document.addEventListener('motion-change',update);
})();
