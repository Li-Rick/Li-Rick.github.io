const {escapeHTML:e,json}=window.Site;
export async function mountPhotoMap(root,photos,onSelect){
 const panel=root.querySelector('.photo-map');
 const modal=root.querySelector('.province-dialog');
 const picker=panel.querySelector('select');
 const counts=new Map();
 for(const photo of photos){const name=photo.province||'浙江省';counts.set(name,(counts.get(name)||0)+1)}
 const peak=Math.max(1,...counts.values());
 const stops=[[17,42,74],[25,91,147],[24,155,194],[79,219,222],[255,224,164]];
 function heatColor(count){
  if(!count)return '#0a1e36';
  const value=Math.sqrt(count/peak)*(stops.length-1),i=Math.min(stops.length-2,Math.floor(value)),t=value-i;
  return '#'+stops[i].map((n,j)=>Math.round(n+(stops[i+1][j]-n)*t).toString(16).padStart(2,'0')).join('');
 }
 panel.querySelector('.map-toolbar>span').outerHTML='<div class="heat-legend" aria-label="足迹热度：从稀疏到丰富"><span>光影足迹</span><i aria-hidden="true"></i><span>稀疏</span><span>丰富</span></div>';
 const readout=document.createElement('p');readout.className='map-readout';readout.setAttribute('aria-live','polite');readout.textContent='悬停或点击省份，探索当地光影';
 panel.querySelector('.map-canvas').before(readout);
 function openProvince(name){
  picker.value=name;
  panel.querySelectorAll('[data-province]').forEach(el=>{const selected=el.dataset.province===name;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected))});
  const entries=photos.map((p,index)=>({...p,index})).filter(p=>(p.province||'浙江省')===name);
  modal.querySelector('h2').textContent=name;
  modal.querySelector('.province-count').textContent='这里的光影';
  modal.querySelector('.province-photos').innerHTML=entries.length?entries.map(p=>`<button class="province-thumb" data-index="${p.index}" aria-label="查看 ${e(p.title)}"><img src="${e(p.thumb)}" alt="${e(p.caption||p.title)}" loading="lazy"><span>${e(p.title)}</span></button>`).join(''):'<p class="province-empty">这里还没有照片，下一段旅程再来点亮。</p>';
  modal.querySelectorAll('[data-index]').forEach(b=>b.addEventListener('click',()=>{modal.close();onSelect(Number(b.dataset.index));root.querySelector('.photo-theater').scrollIntoView({behavior:document.body.classList.contains('motion-off')?'instant':'smooth',block:'start'})}));
  if(!modal.open)modal.showModal();
 }
 modal.querySelector('.province-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('click',event=>{if(event.target===modal)modal.close()});
 picker.addEventListener('change',()=>{if(picker.value)openProvince(picker.value)});
 try{
  const geo=await json('/assets/china-provinces.json');
  const provinces=geo.features.filter(f=>f.properties.name);
  picker.innerHTML='<option value="">选择省份查看照片</option>'+provinces.map(f=>`<option>${e(f.properties.name)}</option>`).join('');
  const project=([lon,lat])=>[(lon-73)*12+25,(54-lat)*14+20];
  const ring=points=>points.map((p,i)=>`${i?'L':'M'}${project(p).map(n=>n.toFixed(1)).join(',')}`).join(' ')+'Z';
  const path=f=>{const c=f.geometry.coordinates;return (f.geometry.type==='MultiPolygon'?c:[c]).map(p=>p.map(ring).join(' ')).join(' ')};
  panel.querySelector('.map-canvas').innerHTML=`<svg viewBox="0 0 760 760" aria-label="中国省级摄影热力图">${geo.features.map(f=>{const name=f.properties.name;const count=counts.get(name)||0;return `<path d="${path(f)}" ${name?`data-province="${e(name)}" tabindex="0" role="button" aria-pressed="false" aria-label="${e(name)}"`: 'aria-hidden="true"'} style="--heat:${heatColor(count)}" class="province ${count?'has-photos':''}" fill-rule="evenodd"><title>${e(name||'海域边界')}</title></path>`}).join('')}${provinces.map(f=>{const pos=f.properties.centroid||f.properties.center;if(!pos)return '';const [x,y]=project(pos),count=counts.get(f.properties.name)||0;return `<text x="${x}" y="${y}" class="province-label ${count/peak>.5?'label-warm':''}">${e(f.properties.name.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g,''))}</text>${count?`<circle class="heat-beacon" cx="${x}" cy="${y-14}" r="3" style="--pulse-delay:-${count%4}s" aria-hidden="true"/>`:''}`}).join('')}</svg>`;
  panel.querySelectorAll('[data-province]').forEach(el=>{const describe=()=>{const name=el.dataset.province;readout.textContent=`${name} · 点击探索当地光影`};el.addEventListener('pointerenter',describe);el.addEventListener('focus',describe);el.addEventListener('click',()=>openProvince(el.dataset.province));el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openProvince(el.dataset.province)}})});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>panel.classList.toggle('map-in-view',entries[0].isIntersecting),{threshold:.1});observer.observe(panel)}else panel.classList.add('map-in-view');
  const visibility=()=>panel.classList.toggle('map-paused',document.hidden);document.addEventListener('visibilitychange',visibility);visibility();
 }catch{
  panel.querySelector('.map-canvas').innerHTML='<p>地图暂时无法加载，仍可选择省份查看照片。</p>';
  const names=[...new Set(photos.map(p=>p.province||'浙江省'))];picker.innerHTML='<option value="">选择省份</option>'+names.map(n=>`<option>${e(n)}</option>`).join('');
 }
}

