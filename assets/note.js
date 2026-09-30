const {escapeHTML:e,json,loadScript}=window.Site,root=document.getElementById('reader-app');
try{
const notes=await json('/content/notes.json'),id=new URLSearchParams(location.search).get('id'),note=notes.find(n=>n.id===id);
if(!note){root.innerHTML='<div class="empty-search"><h1>没有找到这篇笔记</h1><a href="/academic/">返回文献笔记库 →</a></div>'}else{
document.title=`${note.name} · Rick 的阅读室`;
await Promise.all([loadScript('/vendor/marked/lib/marked.umd.js'),loadScript('/vendor/dompurify/dist/purify.min.js')]);
const response=await fetch(note.body);if(!response.ok)throw Error();const markdown=await response.text();
// Shield TeX from Markdown underscore and backslash transformations.
const math=[];const prepared=markdown.replace(/(```[\s\S]*?```|`[^`\n]+`)|(\$\$[\s\S]*?\$\$|(?<!\\)\$[^\n$]+?\$)/g,(m,code,tex)=>{if(code)return code;const i=math.push(tex)-1;return `MATHPLACEHOLDER${i}END`});
let html=marked.parse(prepared,{gfm:true});html=html.replace(/MATHPLACEHOLDER(\d+)END/g,(_,i)=>e(math[Number(i)]));
root.innerHTML=`<header class="reader-head"><div class="note-meta"><span>${e(note.category)}</span><span>${e(note.date)}</span><span>${note.minutes} MIN READ</span></div><h1>${e(note.name)}</h1><p>${e(note.title)}</p><a class="download-note" href="${note.body}" download="${e(note.source)}">下载 Markdown ↓</a></header><div class="reading-layout"><aside class="reader-toc"><span class="tiny">ON THIS PAGE</span><nav aria-label="文章目录"></nav><a class="back-library" href="/academic/">← 返回笔记库</a></aside><article class="prose">${DOMPurify.sanitize(html,{ADD_ATTR:['target'],FORBID_TAGS:['style','iframe'],FORBID_ATTR:['style']})}</article></div><div class="read-progress" aria-hidden="true"></div>`;
const article=root.querySelector('article'),toc=root.querySelector('.reader-toc nav');
article.querySelector('h1')?.remove();
article.querySelectorAll('blockquote>p:first-child').forEach(p=>{p.innerHTML=p.innerHTML.replace(/^\[!(\w+)\]\s*([^<\n]*)/,'<strong>'+ '提示：' +'\u00242</strong>')});
article.querySelectorAll('h2,h3').forEach((h,i)=>{h.id=`section-${i}`;const a=document.createElement('a');a.href=`#${h.id}`;a.textContent=h.textContent;a.className=h.tagName==='H3'?'toc-sub':'';toc.append(a)});
article.querySelectorAll('a').forEach(a=>{if(a.hostname&&a.hostname!==location.hostname){a.target='_blank';a.rel='noopener noreferrer'}});
article.querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='table-wrap';wrap.tabIndex=0;table.before(wrap);wrap.append(table)});
article.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.addEventListener('error',()=>{img.alt='图片暂不可用：'+img.alt})});
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){toc.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}},{rootMargin:'-8% 0px -72% 0px'});article.querySelectorAll('h2,h3').forEach(h=>observer.observe(h));
function progress(){const top=article.getBoundingClientRect().top+scrollY,total=article.scrollHeight-innerHeight;root.querySelector('.read-progress').style.width=`${Math.max(0,Math.min(1,(scrollY-top)/Math.max(1,total)))*100}%`};addEventListener('scroll',progress,{passive:true});progress();
if(math.length){
const css=document.createElement('link');css.rel='stylesheet';css.href='/vendor/katex/dist/katex.min.css';document.head.append(css);
try{await loadScript('/vendor/katex/dist/katex.min.js');await loadScript('/vendor/katex/dist/contrib/auto-render.min.js');renderMathInElement(article,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false,trust:false,strict:'ignore'})}catch{ /* TeX source remains readable if math library cannot load. */ }
}
const diagrams=[...article.querySelectorAll('code.language-mermaid')];
if(diagrams.length){try{await loadScript('/vendor/mermaid/dist/mermaid.min.js');mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'dark',flowchart:{htmlLabels:false},themeVariables:{primaryColor:'#0b466e',primaryTextColor:'#e7f8ff',lineColor:'#42cef5'}});for(let i=0;i<diagrams.length;i++){const code=diagrams[i];try{const result=await mermaid.render(`diagram-${i}`,code.textContent);const figure=document.createElement('figure');figure.className='note-diagram';figure.innerHTML=DOMPurify.sanitize(result.svg,{USE_PROFILES:{svg:true,svgFilters:true},ADD_TAGS:['foreignObject','div','span','p']});code.parentElement.replaceWith(figure)}catch{code.parentElement.classList.add('diagram-source')}}}catch{}}
root.dataset.ready='true';document.dispatchEvent(new Event('content-ready'));
}
}catch(error){root.innerHTML='<div class="load-error">笔记加载失败，请刷新重试，或<a href="/academic/">返回笔记库</a>。</div>';console.error(error)}


