const {escapeHTML:e,json}=window.Site;
export async function mountPhotoMap(root,photos,onSelect){
 const panel=root.querySelector('.photo-map');
 const modal=root.querySelector('.province-dialog');
 const picker=panel.querySelector('select');
 function openProvince(name){
  picker.value=name;
  panel.querySelectorAll('[data-province]').forEach(el=>el.classList.toggle('selected',el.dataset.province===name));
  const entries=photos.map((p,index)=>({...p,index})).filter(p=>(p.province||'浙江省')===name);
  modal.querySelector('h2').textContent=name;
  modal.querySelector('.province-count').textContent=`${entries.length} 张摄影作品`;
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
  panel.querySelector('.map-canvas').innerHTML=`<svg viewBox="0 0 760 760" aria-label="中国省级摄影地图">${geo.features.map(f=>{const name=f.properties.name;const count=photos.filter(p=>(p.province||'浙江省')===name).length;return `<path d="${path(f)}" ${name?`data-province="${e(name)}" tabindex="0" role="button" aria-label="${e(name)}，${count} 张照片"`: 'aria-hidden="true"'} class="province ${count?'has-photos':''}" fill-rule="evenodd"><title>${e(name||'海域边界')} · ${count} 张照片</title></path>`}).join('')}${provinces.map(f=>{const pos=f.properties.centroid||f.properties.center;if(!pos)return '';const [x,y]=project(pos);return `<text x="${x}" y="${y}" class="province-label">${e(f.properties.name.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g,''))}</text>`}).join('')}</svg>`;
  panel.querySelectorAll('[data-province]').forEach(el=>{el.addEventListener('click',()=>openProvince(el.dataset.province));el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openProvince(el.dataset.province)}})});
 }catch{
  panel.querySelector('.map-canvas').innerHTML='<p>地图暂时无法加载，仍可选择省份查看照片。</p>';
  const names=[...new Set(photos.map(p=>p.province||'浙江省'))];picker.innerHTML='<option value="">选择省份</option>'+names.map(n=>`<option>${e(n)}</option>`).join('');
 }
}
