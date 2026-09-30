import urllib.request, tarfile, io, pathlib, json
root=pathlib.Path(__file__).resolve().parents[1]
packages={'animejs':'3.2.2','embla-carousel':'8.6.0','marked':'18.0.14','dompurify':'3.4.16','katex':'0.18.9','mermaid':'10.9.5'}
for name,version in packages.items():
    dest=root/'vendor'/name
    dest.mkdir(exist_ok=True)
    url=f'https://registry.npmjs.org/{name}/-/{name}-{version}.tgz'
    data=urllib.request.urlopen(url,timeout=45).read()
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
        names=[]
        for member in archive.getmembers():
            rel=pathlib.PurePosixPath(member.name).relative_to('package')
            s=str(rel)
            keep=('LICENSE' in s.upper() or 'COPYING' in s.upper() or s=='package.json' or
                  (name=='animejs' and s=='lib/anime.min.js') or
                  (name=='embla-carousel' and s=='embla-carousel.umd.js') or
                  (name=='marked' and s in ['lib/marked.umd.js','lib/marked.esm.js']) or
                  (name=='dompurify' and s=='dist/purify.min.js') or
                  (name=='katex' and s.startswith('dist/') and (s.endswith('.min.js') or s.endswith('.min.css') or '/fonts/' in s)) or
                  (name=='mermaid' and s=='dist/mermaid.min.js'))
            if member.isfile() and keep and '..' not in rel.parts:
                p=dest.joinpath(*rel.parts);p.parent.mkdir(parents=True,exist_ok=True)
                p.write_bytes(archive.extractfile(member).read());names.append(s)
    print(name,version,len(names),'files')
