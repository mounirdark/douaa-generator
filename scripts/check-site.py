"""Check local links, metadata, image alternatives and sitemap without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.images, self.ids, self.meta = [], [], set(), {}
        self.title_count = 0
        self.canonical = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'title':
            self.title_count += 1
        if tag == 'meta':
            self.meta[a.get('name', a.get('property'))] = a.get('content')
        if tag in ('a', 'link') and 'href' in a:
            self.links.append(a['href'])
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a['href']
        if tag == 'script' and 'src' in a:
            self.links.append(a['src'])
        if tag == 'img':
            self.images.append(a)
            self.links.append(a.get('src', ''))

docs = {}
for path in ROOT.rglob('*.html'):
    if any(part in ('node_modules', '.git', 'artifacts') for part in path.parts):
        continue
    page = Page()
    page.feed(path.read_text())
    docs[path] = page
errors = []
for path, page in docs.items():
    if path.name.startswith('google'):
        continue
    if page.title_count != 1:
        errors.append(f'{path}: expected exactly one title')
    for key in ('description', 'viewport', 'og:title', 'og:description', 'og:image', 'og:image:alt', 'twitter:image', 'twitter:image:alt'):
        if not page.meta.get(key):
            errors.append(f'{path}: missing {key}')
    for image in page.images:
        if 'alt' not in image:
            errors.append(f'{path}: image without alt')
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = ((ROOT / url.path.lstrip('/')) if url.path.startswith('/') else path.parent / url.path).resolve() if url.path else path
        if target.is_dir():
            target /= 'index.html'
        if not target.exists():
            errors.append(f'{path}: missing target {link}')
        elif url.fragment and target in docs and unquote(url.fragment) not in docs[target].ids:
            errors.append(f'{path}: missing anchor {link}')

sitemap = ET.parse(ROOT / 'sitemap.xml')
urls = [node.text for node in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
expected = {page.canonical for path, page in docs.items() if path.name == 'index.html' and page.canonical and 'noindex' not in page.meta.get('robots', '') and path.parent.name != 'recherche'}
if len(urls) != len(set(urls)) or set(urls) != expected:
    errors.append('Sitemap URLs differ from indexable static pages')
for error in errors:
    print(error)
assert not errors, f'{len(errors)} errors'
print(f'PASS: {len(docs)} HTML files, {len(urls)} sitemap URLs, internal links, metadata and image alternatives.')
