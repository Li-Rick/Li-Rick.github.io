const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)'),button=document.querySelector('.motion-toggle');
let enabled=!reduced.matches;try{enabled=enabled&&localStorage.getItem('rick-motion')!=='off'}catch{}
let engine=null,cursor=null,raf=0,x=-100,y=-100,cx=-100,cy=-100,visible=false,entrance=[];
function setMotion(value){enabled=value&&!reduced.matches;document.body.classList.toggle('motion-off',!enabled);button.textContent=enabled?'动效 ON':'动效 OFF';button.setAttribute('aria-pressed',String(enabled));document.dispatchEvent(new CustomEvent('motion-change',{detail:enabled}));if(!enabled){cancelAnimationFrame(raf);raf=0;cursor?.classList.remove('visible');entrance.forEach(a=>a.seek(a.duration));document.querySelectorAll('.reveal').forEach(el=>el.classList.add('revealed'))}else if(visible&&fine.matches&&!raf)raf=requestAnimationFrame(track)}
button.addEventListener('click',()=>{setMotion(!enabled);try{localStorage.setItem('rick-motion',enabled?'on':'off')}catch{}});reduced.addEventListener('change',()=>setMotion(!reduced.matches));setMotion(enabled);
try{await Site.loadScript('/vendor/animejs/lib/anime.min.js');engine=window.anime}catch{}
if(enabled&&engine){
entrance.push(engine({targets:'.intro',opacity:[0,1],translateX:[-45,0],duration:850,easing:'easeOutExpo'}));
entrance.push(engine({targets:'.menu-item',rotate:(_,i)=>[-5,-3,-5,-2][i],opacity:[0,1],translateX:[90,0],delay:engine.stagger(110,{start:180}),duration:900,easing:'easeOutExpo'}));
entrance.push(engine({targets:'.page-head,.reader-head',opacity:[0,1],translateY:[28,0],duration:700,easing:'easeOutCubic'}));
}
const seen=new WeakSet(),observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}})},{threshold:.04});
function observe(){document.querySelectorAll('.note-row,.thumb,.project-card,.archive-banner,.photo-theater,.library-controls,.filter-tabs').forEach(el=>{if(seen.has(el))return;seen.add(el);el.style.setProperty('--reveal-delay',(Math.min(Array.from(el.parentElement.children).indexOf(el),7)*45)+'ms');el.classList.add('reveal');if(enabled)observer.observe(el);else el.classList.add('revealed')})}
document.addEventListener('content-ready',observe);observe();
cursor=document.createElement('div');cursor.className='persona-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<i></i><b>+</b>';document.body.append(cursor);
function track(){if(!enabled||!visible||document.hidden||!fine.matches){raf=0;return}cx+=(x-cx)*.2;cy+=(y-cy)*.2;cursor.style.transform=`translate3d(${cx}px,${cy}px,0)`;raf=requestAnimationFrame(track)}
addEventListener('pointermove',event=>{if(event.pointerType==='touch'||!enabled||!fine.matches)return;x=event.clientX;y=event.clientY;visible=true;cursor.classList.add('visible');cursor.classList.toggle('over-link',!!event.target.closest('a,button,input,select'));if(!raf)raf=requestAnimationFrame(track)},{passive:true});
document.addEventListener('pointerleave',()=>{visible=false;cursor.classList.remove('visible')});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;cursor.classList.remove('visible')}else if(visible&&enabled&&!raf)raf=requestAnimationFrame(track)});
addEventListener('pointerdown',event=>{if(!enabled||event.pointerType==='touch'||!engine)return;const burst=document.createElement('div');burst.className='cursor-burst';burst.style.left=event.clientX+'px';burst.style.top=event.clientY+'px';burst.setAttribute('aria-hidden','true');document.body.append(burst);engine({targets:burst,scale:[.3,2.6],rotate:[-30,100],opacity:[.9,0],duration:550,easing:'easeOutExpo',complete:()=>burst.remove()})});



