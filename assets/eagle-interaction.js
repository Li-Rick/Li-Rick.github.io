const eagle=document.querySelector('.eagle-trigger');
if(eagle){
 let hovering=false,pinned=false,keyboardFocus=false,pointerKind='mouse';
 function update(){const revealed=hovering||pinned||keyboardFocus;eagle.classList.toggle('is-revealed',revealed);eagle.setAttribute('aria-pressed',String(revealed));eagle.setAttribute('aria-label',revealed?'收起白鹰':'展开白鹰')}
 eagle.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovering=true;update()}});
 eagle.addEventListener('pointerleave',()=>{hovering=false;update()});
 eagle.addEventListener('focus',()=>{keyboardFocus=eagle.matches(':focus-visible');update()});
 eagle.addEventListener('blur',()=>{keyboardFocus=false;pinned=false;update()});
 eagle.addEventListener('pointerdown',event=>{pointerKind=event.pointerType});
 eagle.addEventListener('click',event=>{if(event.detail!==0&&pointerKind==='mouse')return;pinned=!pinned;keyboardFocus=false;update()});
 eagle.addEventListener('keydown',event=>{if(event.key==='Escape'){pinned=false;keyboardFocus=false;hovering=false;update();eagle.blur()}});
}
