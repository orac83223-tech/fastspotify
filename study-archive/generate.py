#!/usr/bin/env python3
"""Build a portable, dependency-free public learning archive from data/articles.json."""
import html, json, re
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parent
FEEDS={'learning':'CS·AI·금융공학','insight':'관심사 인사이트'}
def esc(x):return html.escape(str(x),quote=True)
def rich(s):
 # Only Markdown HTTPS links are supported. All raw HTML is escaped.
 out=[];start=0
 for m in re.finditer(r'\[([^\]]+)\]\((https://[^\s)]+)\)',s):
  out.append(esc(s[start:m.start()]));out.append('<a href="'+esc(m[2])+'" target="_blank" rel="noopener noreferrer">'+esc(m[1])+'</a>');start=m.end()
 out.append(esc(s[start:]));return ''.join(out)
def paragraphs(s):return ''.join('<p>'+rich(p)+'</p>' for p in s)
def badge(a):return '<span class="pill">초기 예시</span>' if a.get('sample') else '<span class="pill">읽을거리</span>'
def mark():return '<svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M3 4h9c2 0 3 1 3 3v17c-1-2-3-3-6-3H3V4Zm22 0h-7v17h7V4Z" fill="currentColor"/></svg>'
def head(title,prefix=''):
 return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="CS·AI·금융공학과 관심사 인사이트. 배움이 쌓이는 공개 아카이브."><meta name="robots" content="noindex, nofollow"><title>'+esc(title)+' | 매일의 발견</title><link rel="icon" href="'+prefix+'favicon.svg"><link rel="stylesheet" href="'+prefix+'style.css"></head><body>'
def header(article=False):
 pre='../' if article else ''
 return '<a class="skip" href="#content">본문으로 이동</a><header class="site-header"><a href="'+pre+'index.html" class="brand">'+mark()+'<span>매일의 발견</span></a><nav aria-label="메뉴"><a href="'+pre+'index.html#archive">아카이브</a>'+('' if article else '<button id="nav-saved">저장한 글 <span class="count" id="saved-count">0</span></button>')+'</nav></header>'
def foot(prefix=''):
 return '<footer><a href="'+prefix+'index.html" class="brand">'+mark()+'<span>매일의 발견</span></a><p>공개 학습 아카이브 · 시간대 Asia/Seoul</p><span>오래 남을 배움을 위해.</span></footer>'
def diagram(feed):
 inside='<div class="orbit o1"></div><div class="orbit o2"></div><div class="orbit o3"></div><span class="orbit-core"></span>' if feed=='learning' else '<div class="arch a1"></div><div class="arch a2"></div><div class="arch a3"></div>'
 label='UNDERSTAND THE SYSTEM' if feed=='learning' else 'FOLLOW YOUR CURIOSITY'
 return '<div class="diagram '+feed+'" aria-hidden="true">'+inside+'<span class="diagram-label">'+label+'</span></div>'
def card(a):
 return f'''<article class="feature-card {a['feed']}"><div class="feature-top"><span class="feed-tag">{FEEDS[a['feed']]}</span>{badge(a)}</div>{diagram(a['feed'])}<div class="feature-body"><p class="card-meta">{esc(a['category'])} <span>·</span> {a['minutes']}분 읽기</p><h3><a href="articles/{a['id']}.html">{esc(a['title'])}</a></h3><p>{esc(a['summary'])}</p><div class="feature-foot"><span>{a['date'].replace('-','.')}</span><a class="read-link" href="articles/{a['id']}.html">읽어보기 <span aria-hidden="true">↗</span></a></div></div></article>'''
def row(a):
 search=' '.join([a['title'],a['summary'],a['category'],FEEDS[a['feed']]]+[p for s in a['sections'] for p in s['paragraphs']])
 return f'''<article class="list-item" data-id="{a['id']}" data-feed="{a['feed']}" data-category="{esc(a['category'])}" data-date="{a['date']}" data-search="{esc(search.lower())}"><div class="mini-symbol {a['feed']}" aria-hidden="true">{'◎' if a['feed']=='learning' else '✳'}</div><div class="list-content"><p class="card-meta"><span class="feed-name {a['feed']}">{FEEDS[a['feed']]}</span><span>·</span>{esc(a['category'])}{'<span class="sample-mini">초기 예시</span>' if a.get('sample') else ''}</p><h3><a href="articles/{a['id']}.html">{esc(a['title'])}</a></h3><p class="list-summary">{esc(a['summary'])}</p><p class="list-meta">{a['date'].replace('-','.')} <span>·</span> {a['minutes']}분 읽기</p></div><button class="bookmark" data-save="{a['id']}" aria-label="{esc(a['title'])} 저장" aria-pressed="false">☆</button><a class="list-arrow" href="articles/{a['id']}.html" aria-label="{esc(a['title'])} 읽기">↗</a></article>'''
def validate(articles):
 seen=set()
 for a in articles:
  assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',a['date'])
  assert re.fullmatch(r'[a-z0-9-]{1,100}',a['id']) and a['id'] not in seen
  seen.add(a['id']); assert a['feed'] in FEEDS
  if not a.get('sample'):assert a['id']==a['date']+'-'+a['feed']
  assert isinstance(a['minutes'],int) and 1<=a['minutes']<=90
  assert a['sources'] and a['sections']
  for s in a['sources']:assert urlparse(s['url']).scheme=='https'
  assert not re.search(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',json.dumps(a,ensure_ascii=False),re.I),'Email addresses may not be published'
def build():
 articles=json.loads((ROOT/'data/articles.json').read_text());validate(articles)
 articles.sort(key=lambda a:(a['date'],not a.get('sample',False),a['feed']),reverse=True)
 latest=[next((a for a in articles if a['feed']==f),None) for f in FEEDS];latest=[a for a in latest if a]
 options=''.join('<option>'+esc(c)+'</option>' for c in sorted(set(a['category'] for a in articles)))
 notice='지금은 사이트 구성을 보여 주는 짧은 초기 예시 2편을 담았습니다. 정규 글은 발행되는 대로 이곳에 쌓입니다.' if all(a.get('sample') for a in articles) else '자료의 근거와 해설을 함께 읽고, 마음에 남는 글은 저장해 두세요.'
 body=f'''{head('배움이 쌓이는 서재')}{header()}<main id="content"><section class="intro"><div><p class="eyebrow"><span class="small-dot"></span> THE DAILY DISCOVERY</p><h1>조금씩 읽고,<br><em>오래 남기기.</em></h1><p class="intro-copy">복잡한 세상을 이해하는 개념부터<br class="mobile-break"> 일상을 새롭게 보는 질문까지.<br>하나의 질문을 깊이 읽는 작은 서재입니다.</p></div><aside class="intro-aside"><span class="issue-label">A LITTLE, EVERY DAY</span><div class="sunburst" aria-hidden="true">✳</div><p>좋은 질문 하나가<br>하루의 시야를 넓힙니다.</p><span class="aside-bottom">LEARN · CONNECT · REFLECT</span></aside></section><section class="latest" aria-labelledby="latest-title"><div class="section-head"><div><span class="section-num">01 /</span><h2 id="latest-title">가장 최근의 읽을거리</h2></div><span class="muted">{articles[0]['date'].replace('-','.') if articles else ''}</span></div><div class="latest-grid">{''.join(card(a) for a in latest)}</div><div class="notice"><span aria-hidden="true">i</span><p>{notice}</p></div></section><section id="archive" class="archive" aria-labelledby="archive-title"><div class="section-head"><div><span class="section-num">02 /</span><h2 id="archive-title">차곡차곡, 아카이브</h2></div><span class="muted">총 {len(articles)}편</span></div><div class="toolbar"><div class="feed-tabs" role="group" aria-label="읽을거리 종류"><button class="active" data-feed-filter="all" aria-pressed="true">전체</button><button data-feed-filter="learning" aria-pressed="false">CS·AI·금융공학</button><button data-feed-filter="insight" aria-pressed="false">관심사 인사이트</button></div><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="제목, 주제, 키워드 검색" aria-label="글 검색"></label></div><div class="filters"><label><span>주제</span><select id="category" aria-label="주제 선택"><option value="all">모든 주제</option>{options}</select></label><label><span>날짜</span><input id="date" type="date" aria-label="발행 날짜"></label><button id="saved-filter" class="saved-filter" aria-pressed="false">☆ 저장한 글</button><button class="reset" id="reset" hidden>필터 초기화</button></div><div class="list-heading"><span>읽을거리</span><span id="result-count">{len(articles)}편</span></div><div class="article-list" aria-live="polite">{''.join(row(a) for a in articles)}<div class="empty" id="empty" hidden><span>⌕</span><h3>조건에 맞는 글이 아직 없어요.</h3><p>다른 키워드로 찾거나 필터를 초기화해 보세요.</p><button id="empty-reset">전체 글 보기</button></div></div><p class="saved-note">저장한 글 표시는 이 브라우저에만 보관됩니다.</p></section><section class="closing"><span>“</span><p>많이 아는 것보다,<br class="mobile-break"> 어제와 다르게 바라보는 것.</p><a href="#latest-title">다시 읽으러 가기 ↑</a></section></main>{foot()}<script src="app.js" defer></script></body></html>'''
 (ROOT/'index.html').write_text(body)
 (ROOT/'articles').mkdir(exist_ok=True)
 for a in articles:
  sections=''.join('<section><p class="chapter">'+str(i+1).zfill(2)+'</p><h2>'+esc(s['heading'])+'</h2>'+paragraphs(s['paragraphs'])+'</section>' for i,s in enumerate(a['sections']))
  questions=''.join('<details><summary><span>Q'+str(i+1)+'.</span> '+esc(q['question'])+'<small>해설 보기 +</small></summary><p>'+rich(q['answer'])+'</p></details>' for i,q in enumerate(a.get('questions',[])))
  sources=''.join('<li><a href="'+esc(s['url'])+'" target="_blank" rel="noopener noreferrer">'+esc(s['title'])+' ↗</a><p>'+esc(s['detail'])+'</p></li>' for s in a['sources'])
  sample='<aside class="sample-notice">사이트 개설을 위한 짧은 예시 글입니다. 정규 학습 회차나 과거 발행분이 아닙니다.</aside>' if a.get('sample') else ''
  page=f'''{head(a['title'],'../')}{header(True)}<div class="reading-progress" id="reading-progress"></div><main class="reading-main" id="content" data-article-id="{a['id']}"><div class="reading-tools"><button id="article-save" aria-pressed="false">☆ 글 저장</button><button id="font-size" aria-pressed="false">가 +</button><button id="print">인쇄</button></div><div class="article-eyebrow">{FEEDS[a['feed']]} <span> / </span> {esc(a['category'])}</div><h1>{esc(a['title'])}</h1><p class="reading-summary">{esc(a['summary'])}</p><div class="reading-meta"><time datetime="{a['date']}">{a['date'].replace('-','.')}</time><span>·</span><span>{a['minutes']}분 읽기</span>{badge(a)}</div>{sample}<div class="article-body">{sections}<section class="question-section"><p class="eyebrow">PAUSE & REFLECT</p><h2>잠깐, 내 언어로 설명해 보기</h2>{questions}</section><section class="sources"><p class="eyebrow">READ FURTHER</p><h2>확인한 원자료</h2><p class="source-date">원문 확인일: {a['date']} (한국시간)</p><ol>{sources}</ol></section></div><div class="back-bottom"><a href="../index.html#archive">← 다른 읽을거리 살펴보기</a><span>조금씩, 오래.</span></div></main>{foot('../')}<script src="../reading.js" defer></script></body></html>'''
  (ROOT/'articles'/f"{a['id']}.html").write_text(page)
 print(f'Built {len(articles)} articles and archive.')
if __name__=='__main__':build()
