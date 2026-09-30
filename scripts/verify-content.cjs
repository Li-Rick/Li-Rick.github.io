const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const notes=JSON.parse(fs.readFileSync(path.join(root,'content/notes.json'),'utf8'));
const photos=JSON.parse(fs.readFileSync(path.join(root,'content/photos.json'),'utf8'));
const ids=new Set(notes.map(n=>n.id));assert.equal(ids.size,notes.length);
let links=0;
function local(url){assert.ok(fs.existsSync(path.join(root,decodeURI(url))),'Missing '+url);links++}
for(const note of notes){local(note.body);const body=fs.readFileSync(path.join(root,note.body),'utf8');for(const m of body.matchAll(/\]\((\/[^)]+)\)/g)){const url=new URL(m[1],'http://local');if(url.pathname==='/academic/note/')assert.ok(ids.has(url.searchParams.get('id')));else local(url.pathname)}}
for(const photo of photos){local(photo.src);local(photo.thumb);assert.ok(photo.width>0&&photo.height>0)}
for(const file of ['2021/06/10/测试文章/index.html','2026/03/06/hello-world/index.html'])assert.ok(!fs.existsSync(path.join(root,file)));
for(const file of ['index.html','academic/index.html','academic/note/index.html','photography/index.html','projects/index.html','about/index.html']){const html=fs.readFileSync(path.join(root,file),'utf8');for(const m of html.matchAll(/(?:href|src)="(\/(?:assets|vendor)\/[^"]+)"/g))local(m[1]);assert.ok(!html.includes('Hello World'));assert.ok(!html.includes('测试文章'))}
console.log(JSON.stringify({notes:notes.length,photos:photos.length,verifiedLocalReferences:links,deletedArticles:'PASS'}));
