"""Append a photo and thumbnail without replacing existing album entries."""
import argparse
import json
import os
from pathlib import Path
import re
import tempfile
from PIL import Image, ImageOps

def add_photo(image, name, province, city='', root=None):
    root = Path(root) if root else Path(__file__).resolve().parents[1]
    source = Path(image).expanduser().resolve()
    if not name.strip():
        raise ValueError('照片名称不能为空')
    geo = json.loads((root / 'assets/china-provinces.json').read_text(encoding='utf-8-sig'))
    names = [f['properties']['name'] for f in geo['features'] if f['properties']['name']]
    matches = [n for n in names if n == province or re.sub(r'省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区', '', n) == province]
    if len(matches) != 1:
        raise ValueError('未知省份，请填写完整省级名称，例如浙江省、山东省、黑龙江省')
    index_file = root / 'content/photos.json'
    photos = json.loads(index_file.read_text(encoding='utf-8-sig'))
    number = max([int(p['id'][6:]) for p in photos if re.fullmatch(r'frame-\d+', p['id'])] or [0]) + 1
    while True:
        ident = f'frame-{number:02d}'
        main = root / f'content/photos/{ident}.jpg'
        thumb = root / f'content/thumbs/{ident}.webp'
        if not main.exists() and not thumb.exists():
            break
        number += 1
    # Decode and prepare both images before writing anything to the website.
    with Image.open(source) as image_file:
        im = ImageOps.exif_transpose(image_file).convert('RGB')
        im.thumbnail((3200, 3200))
        small = im.copy()
        small.thumbnail((720, 720))
        width, height = im.size
    entry = dict(id=ident, title=name.strip(), originalName=source.name,
                 caption=name.strip(), src=f'/content/photos/{ident}.jpg',
                 thumb=f'/content/thumbs/{ident}.webp', width=width, height=height,
                 orientation='横向' if width >= height else '竖向', province=matches[0])
    if city.strip():
        entry['city'] = city.strip()
    main.parent.mkdir(parents=True, exist_ok=True)
    thumb.parent.mkdir(parents=True, exist_ok=True)
    created = []
    temp_path = None
    try:
        with main.open('xb') as stream:
            created.append(main)
            im.save(stream, 'JPEG', quality=90)
        with thumb.open('xb') as stream:
            created.append(thumb)
            small.save(stream, 'WEBP', quality=85)
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=index_file.parent,
                                         delete=False, suffix='.tmp') as stream:
            temp_path = Path(stream.name)
            json.dump([entry] + photos, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
        os.replace(temp_path, index_file)
    except Exception:
        for file in created:
            file.unlink(missing_ok=True)
        if temp_path:
            temp_path.unlink(missing_ok=True)
        raise
    return entry

def main():
    parser = argparse.ArgumentParser(description='添加摄影作品，自动生成主图和缩略图并登记省份')
    parser.add_argument('--image', help='输入图片路径')
    parser.add_argument('--name', help='照片名称')
    parser.add_argument('--province', help='拍摄省份，例如浙江或浙江省')
    parser.add_argument('--city', default='', help='可选拍摄城市')
    args = parser.parse_args()
    try:
        entry = add_photo(args.image or input('图片路径：').strip().strip('"'),
                          args.name or input('照片名称：').strip(),
                          args.province or input('拍摄省份：').strip(), args.city)
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as error:
        parser.exit(1, f'添加失败：{error}\n')
    print(f"已添加 {entry['id']}：{entry['title']} / {entry['province']}。刷新本地页面即可查看；上线需要提交并发布。")

if __name__ == '__main__':
    main()
