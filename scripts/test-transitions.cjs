const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/transitions.js'),'utf8');
function setup({path='/',off=false,reduced=false,storageFails=false}={}){
 const documentEvents={},windowEvents={},nodes=[];
 const media={matches:reduced,addEventListener(type,fn){this.changed=fn}};
 const location={href:'https://test.local'+path,origin:'https://test.local'};
 const document={head:{append:el=>nodes.push(el)},documentElement:{dataset:{}},body:{classList:{contains:()=>off}},createElement:()=>({}),addEventListener:(type,fn)=>documentEvents[type]=fn};
 vm.runInNewContext(source,{document,location,URL,matchMedia:()=>media,localStorage:{getItem(){if(storageFails)throw Error('blocked');return off?'off':'on'}},addEventListener:(type,fn)=>windowEvents[type]=fn});
 function transition(){return {types:new Set(),skipped:false,skipTransition(){this.skipped=true},finished:Promise.resolve()}}
 return {document,documentEvents,windowEvents,nodes,media,transition};
}
for(const kind of ['home','academic','reading','photography','projects','about']){
 const paths={home:'/',academic:'/academic/',reading:'/academic/note/?id=n01',photography:'/photography/',projects:'/projects/',about:'/about/'};
 const page=setup();const outgoing=page.transition();page.windowEvents.pageswap({viewTransition:outgoing,activation:{entry:{url:'https://test.local'+paths[kind]}}});assert.ok(outgoing.types.has(kind));assert.equal(page.document.documentElement.dataset.pageTransition,kind);
 const target=setup({path:paths[kind]});const incoming=target.transition();target.windowEvents.pagereveal({viewTransition:incoming});assert.ok(incoming.types.has(kind));assert.equal(incoming.skipped,false);
 assert.equal(target.nodes.length,1);assert.equal(target.nodes[0].id,'page-transition-policy');assert.equal(target.documentEvents.click,undefined);
}
for(const options of [{off:true},{reduced:true}]){const page=setup(options);assert.match(page.nodes[0].textContent,/navigation: none/);const incoming=page.transition();page.windowEvents.pagereveal({viewTransition:incoming});assert.equal(incoming.skipped,true)}
const toggle=setup({off:true});toggle.document.body.classList.contains=()=>false;toggle.documentEvents['motion-change']({detail:true});assert.match(toggle.nodes[0].textContent,/navigation: auto/);
const enabled=setup();const active=enabled.transition();enabled.windowEvents.pagereveal({viewTransition:active});enabled.documentEvents['motion-change']({detail:false});assert.equal(active.skipped,true);assert.match(enabled.nodes[0].textContent,/navigation: none/);
for(const url of ['https://other.local/photography/','https://test.local/content/photos/frame-01.jpg']){const page=setup(),t=page.transition();page.windowEvents.pageswap({viewTransition:t,activation:{entry:{url}}});assert.equal(t.skipped,true)}
const unsupported=setup();unsupported.windowEvents.pagereveal({viewTransition:null});assert.equal(unsupported.nodes.length,1);
assert.match(setup({storageFails:true}).nodes[0].textContent,/navigation: auto/);
console.log('PASS: paired page transitions, no overlays or intercepted links, route types, motion preference and fallback');

