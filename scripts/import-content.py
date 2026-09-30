from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import re, json, hashlib, shutil, math
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('D:/WIG')
PHOTO=Path('C:/Users/Lenovo/Pictures/壁纸')
OUT=ROOT/'content'; OUT.mkdir(exist_ok=True)
for folder in ['notes','media','photos','thumbs']:(OUT/folder).mkdir(exist_ok=True)
def field(front,key):
    m=re.search(r'^'+re.escape(key)+r':\s*(.*)$',front,re.M)
    return m.group(1).strip().strip('\"\'') if m else ''
def publishable(p):
    raw=p.read_text(encoding='utf-8-sig')
    front=raw.split('---',2)[1] if raw.startswith('---') else ''
    return bool(field(front,'method_name')) or any(word in p.stem for word in ['综述','调研','评估','索引'])
files=[p for p in sorted(SOURCE.glob('*.md')) if publishable(p)]
previous=json.loads((OUT/'notes.json').read_text(encoding='utf-8')) if (OUT/'notes.json').exists() else []
mapping={Path(n['source']).stem:n['id'] for n in previous if Path(n['source']).stem in {p.stem for p in files}}
next_id=max([int(n['id'][1:]) for n in previous]+[0])+1
for p in files:
    if p.stem not in mapping:mapping[p.stem]=f'n{next_id:02}';next_id+=1
for p in files:
    raw=p.read_text(encoding='utf-8-sig');front=raw.split('---',2)[1] if raw.startswith('---') else ''
    alias=field(front,'method_name')
    if alias:mapping[alias]=mapping[p.stem]
notes=[];missing=set();copied={}
def asset(url):
    raw=url.strip().replace('\\','/')
    if raw.startswith(('https:','http:','#','data:')):return raw
    raw=raw.replace('%20',' ')
    if '/WIG/' in raw:raw=raw.split('/WIG/',1)[1]
    path=SOURCE/raw
    if path.exists() and path.is_file() and path.suffix.lower() in ['.png','.jpg','.jpeg','.svg','.webp','.pdf']:
        digest=hashlib.sha256(str(path).encode()).hexdigest()[:12]
        target=OUT/'media'/(digest+path.suffix.lower());shutil.copy2(path,target)
        copied[str(path)]=str(target.relative_to(ROOT))
        return '/'+str(target.relative_to(ROOT)).replace('\\','/')
    missing.add(raw);return ''
for p in files:
    text=p.read_text(encoding='utf-8-sig');front=''
    if text.startswith('---'):
        parts=text.split('---',2)
        if len(parts)==3:front,text=parts[1],parts[2].strip()
    title=field(front,'title') or p.stem
    name=field(front,'method_name') or p.stem
    category='论文精读' if field(front,'method_name') else '研究草稿'
    if '综述' in p.stem or '调研' in p.stem or '评估' in p.stem:category='研究综述'
    if '索引' in p.stem:category='阅读索引'
    def wikilink(m):
        target,_,label=m.group(1).partition('|');stem=target.split('#')[0];label=label or stem
        return f'[{label}](/academic/note/?id={mapping[stem]})' if stem in mapping else label
    text=re.sub(r'!\[\[([^\]]+)\]\]',lambda m:f'![{Path(m.group(1)).stem}]({asset(m.group(1))})',text)
    text=re.sub(r'\[\[([^\]]+)\]\]',wikilink,text)
    def mdlink(m):
        image,label,url=m.groups()
        if url.startswith(('http:','https:','#','/academic/','/content/')):return m.group(0)
        if url.endswith('.md'):
            stem=Path(url).stem
            if stem in mapping:return f'[{label}](/academic/note/?id={mapping[stem]})'
        dest=asset(url)
        return f'{image}[{label}]({dest})' if dest else label+'（本地附件未收录）'
    text=re.sub(r'(!?)\[([^\]]*)\]\(([^\n]+?)\)',mdlink,text)
    text=re.sub(r'(<img\b[^>]*src=[\"\'])([^\"\']+)',lambda m:m.group(1)+(asset(m.group(2)) or m.group(2)),text)
    summary=re.search(r'## 一句话总结\s*\n+([^#]+?)(?:\n\n|\n##)',text)
    excerpt=(summary.group(1) if summary else re.sub(r'^#+.*$','',text,flags=re.M).strip().split('\n\n')[0])
    excerpt=re.sub(r'\[!\w+\]','',excerpt)
    excerpt=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',excerpt)
    excerpt=re.sub(r'[>*`\[\]#]','',excerpt);excerpt=re.sub(r'\s+',' ',excerpt)[:180]
    date=field(front,'updated') or field(front,'created') or field(front,'date') or '未标注日期'
    note={'id':mapping[p.stem],'name':name,'title':title,'category':category,'date':date,'year':field(front,'year'),'excerpt':excerpt,'minutes':max(1,math.ceil(len(text)/650)),'source':p.name,'body':'/content/notes/'+mapping[p.stem]+'.md'}
    (OUT/'notes'/(note['id']+'.md')).write_text(text,encoding='utf-8');notes.append(note)
notes.sort(key=lambda n:n['date'] if re.match(r'\d',n['date']) else '',reverse=True)
(OUT/'notes.json').write_text(json.dumps(notes,ensure_ascii=False,indent=2),encoding='utf-8')
photos=[];thumbs=[]
captions=['午后小憩','海的蓝调','穹顶之上','时钟与晴空','粉色花期','林间小景','花开正好','日常的一抹黄','金色微光','走进森林','秋叶的温度','花瓣铺成的路','群峰之间','林中的访客','红色心愿','一棵树的远方','枝头春意','夜色倒影','灯下的暖意','山谷里的春天','花田与远山','驶向春天','花海小火车','向天空生长','灯火成花','夜的光斑']
for i,p in enumerate(sorted(PHOTO.iterdir())):
    if p.suffix.lower() not in ['.jpg','.jpeg','.png','.webp']:continue
    ident=f'frame-{i+1:02}';target=OUT/'photos'/(ident+p.suffix.lower());shutil.copy2(p,target)
    with Image.open(p) as im:
        im=ImageOps.exif_transpose(im).convert('RGB');w,h=im.size
        small=im.copy();small.thumbnail((720,720));small.save(OUT/'thumbs'/(ident+'.webp'),'WEBP',quality=85)
        thumbs.append((ident,ImageOps.fit(im,(240,150))))
    photos.append({'id':ident,'title':captions[i] if i<len(captions) else p.stem,'originalName':p.name,'caption':captions[i] if i<len(captions) else p.stem,'src':'/content/photos/'+target.name,'thumb':'/content/thumbs/'+ident+'.webp','width':w,'height':h,'orientation':'横向' if w>=h else '竖向'})
(OUT/'photos.json').write_text(json.dumps(photos,ensure_ascii=False,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(960,math.ceil(len(thumbs)/4)*180),'#081729');draw=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(thumbs):
    x=(i%4)*240;y=(i//4)*180;sheet.paste(im,(x,y));draw.text((x+10,y+155),name,fill='white')
(ROOT/'.preview').mkdir(exist_ok=True);sheet.save(ROOT/'.preview'/'photo-contact.jpg')
(ROOT/'.preview'/'content-import-report.json').write_text(json.dumps({'notes':len(notes),'photos':len(photos),'copiedAttachments':copied,'unavailableAttachments':sorted(missing)},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'notes':len(notes),'photos':len(photos),'attachments':len(copied),'unavailable':len(missing)},ensure_ascii=False))
