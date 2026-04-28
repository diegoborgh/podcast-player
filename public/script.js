// ── Fallback data (shown if /api/trending fails) ──────────────────
const TRENDING_FALLBACK = [
  {id:1, title:'The Daily',           author:'The New York Times', emoji:'📰', bg:'linear-gradient(135deg,#1a1a2e,#16213e)', cat:'News'},
  {id:2, title:'Crime Junkie',        author:'audiochuck',         emoji:'🔍', bg:'linear-gradient(135deg,#2d1b4e,#1a0a2e)', cat:'True Crime'},
  {id:3, title:'Huberman Lab',        author:'Andrew Huberman',    emoji:'🧠', bg:'linear-gradient(135deg,#0a3d62,#1e3799)', cat:'Health'},
  {id:4, title:'Lex Fridman Podcast', author:'Lex Fridman',        emoji:'🤖', bg:'linear-gradient(135deg,#1a1a1a,#3a3a3a)', cat:'Technology'},
  {id:5, title:'How I Built This',    author:'NPR',                emoji:'🚀', bg:'linear-gradient(135deg,#1e3a1e,#2d5a27)', cat:'Business'},
  {id:6, title:'SmartLess',          author:'Jason Bateman & Co.', emoji:'😂', bg:'linear-gradient(135deg,#3a1c71,#d76d77)', cat:'Comedy'},
  {id:7, title:'Radiolab',           author:'WNYC Studios',        emoji:'🔬', bg:'linear-gradient(135deg,#134e5e,#71b280)', cat:'Science'},
  {id:8, title:'Serial',             author:'Serial Productions',  emoji:'📻', bg:'linear-gradient(135deg,#373b44,#4286f4)', cat:'Investigative'},
];
const CATS = ['All','News','True Crime','Health','Technology','Business','Comedy','Science'];

const MOCK_EPS = p => [
  {id:`${p.id}-1`,title:'How AI Is Reshaping Everything We Know',  date:'Apr 22, 2026',dur:'42 min',src:''},
  {id:`${p.id}-2`,title:'The Week That Changed Everything',         date:'Apr 19, 2026',dur:'38 min',src:''},
  {id:`${p.id}-3`,title:'Deep Dive: What Happens Next',            date:'Apr 15, 2026',dur:'55 min',src:''},
  {id:`${p.id}-4`,title:'Interview: The Future of Work',           date:'Apr 10, 2026',dur:'1h 12 min',src:''},
  {id:`${p.id}-5`,title:'Breaking Down the Numbers',               date:'Apr 7, 2026',dur:'29 min',src:''},
].map(ep => ({...ep, podcastTitle:p.title, podcastEmoji:p.emoji||'🎙️', podcastBg:p.bg||'var(--surface2)'}));

// ── State ─────────────────────────────────────────────────────────
const audio = document.getElementById('audio');
const S = {
  cur: null, playing: false, speed: 1, vol: 80, muted: false,
  queue:   JSON.parse(localStorage.getItem('aw_q')    || '[]'),
  favs:    JSON.parse(localStorage.getItem('aw_favs') || '[]'),
  hist:    JSON.parse(localStorage.getItem('aw_hist') || '[]'),
  played:  JSON.parse(localStorage.getItem('aw_done') || '[]'),
  sh:      JSON.parse(localStorage.getItem('aw_sh')   || '[]'),
  trending: [...TRENDING_FALLBACK],
  view: 'home', prevView: null,
};

const $    = id => document.getElementById(id);
const fT   = s  => { const m = Math.floor(s/60), sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; };
const isFav  = id => S.favs.some(f => f.id === id);
const isDone = id => S.played.includes(id);
const save   = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const J      = o => JSON.stringify(o).replace(/'/g, "&#39;").replace(/"/g, '&quot;');
const H      = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stripHTML(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('br').forEach(el => el.replaceWith('\n'));
  tmp.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach(el => el.append('\n'));
  return (tmp.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// ── Views ─────────────────────────────────────────────────────────
function showView(n) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('view-' + n).classList.add('active');
  S.prevView = S.view; S.view = n;
}
function showHome() { showView('home'); renderTrending(S.trending); }
function goBack()   { S.prevView ? showView(S.prevView) : showHome(); }

// ── Hero ──────────────────────────────────────────────────────────
let _heroPod = TRENDING_FALLBACK[0];

function renderHero() {
  _heroPod = S.trending[Math.floor(Math.random() * S.trending.length)];
  const bgEl = $('hero-bg');
  if (_heroPod.artwork) {
    bgEl.style.background = '';
    bgEl.innerHTML = `<img src="${_heroPod.artwork}" onerror="this.parentElement.textContent='🎙️'" />`;
  } else {
    bgEl.innerHTML = '';
    bgEl.textContent = _heroPod.emoji || '🎙️';
    bgEl.style.background = _heroPod.bg || 'linear-gradient(135deg,#1a0a00,#2d1500)';
  }
  $('hero-title').textContent = _heroPod.title;
  $('hero-sub').textContent   = _heroPod.author || '';
}
function openHero() { clickPodcast(_heroPod); }

// ── Trending ──────────────────────────────────────────────────────
function renderTrending(list) {
  $('trending-grid').innerHTML = list.map((p, i) => `
    <div class="pc" onclick='clickPodcast(${J(p)})'>
      <div class="pc-art-wrap">
        ${p.artwork
          ? `<img class="pc-art" src="${p.artwork}" loading="lazy" onerror="this.style.display='none'" />`
          : `<div class="pc-art-ph" style="background:${p.bg || 'var(--surface2)'};">${p.emoji || '🎙️'}</div>`}
        <span class="pc-rank">#${i + 1}</span>
        <button class="fav-btn ${isFav(p.id) ? 'on' : ''}" data-pid="${p.id}" onclick="event.stopPropagation();toggleFav(${J(p)})">
          <i class="fa-${isFav(p.id) ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="pc-body">
        <div class="pc-t">${p.title}</div>
        <div class="pc-a">${p.author || ''}</div>
      </div>
    </div>`).join('');
}

function renderCats() {
  $('cat-strip').innerHTML = CATS.map(c =>
    `<button class="cat ${c === 'All' ? 'on' : ''}" onclick="filterCat('${c}',this)">${c}</button>`
  ).join('');
}

function filterCat(cat, btn) {
  document.querySelectorAll('.cat').forEach(c => c.classList.remove('on'));
  btn.classList.add('on');
  renderTrending(cat === 'All' ? S.trending : S.trending.filter(p => p.cat === cat));
}

// ── Podcast routing ───────────────────────────────────────────────
function clickPodcast(p) {
  if (p.itunesId) openPodcastAPI(p);
  else openPodcast(p);
}

// ── Podcast detail (mock episodes) ───────────────────────────────
function openPodcast(p) {
  $('det-header').innerHTML = `
    <div class="pdh">
      <div class="pdh-art" style="background:${p.bg || 'var(--surface2)'};">
        ${p.artwork ? `<img src="${p.artwork}" style="width:100%;height:100%;object-fit:cover;" />` : (p.emoji || '🎙️')}
      </div>
      <div class="pdh-info">
        <div class="pdh-t">${H(p.title)}</div>
        <div class="pdh-a">${H(p.author || '')}</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px;">
          ${p.cat ? `<span class="badge">${H(p.cat)}</span>` : ''}
          <button class="btn-go fav-detail-btn ${isFav(p.id) ? 'saved' : ''}" data-pid="${p.id}" style="padding:5px 13px;font-size:12px;border-radius:99px;"
            onclick="toggleFav(${J(p)});">
            ${isFav(p.id) ? '♥ Saved' : '♡ Save'}
          </button>
        </div>
      </div>
    </div>
    ${renderPodDesc(p.description)}`;
  const eps = MOCK_EPS(p);
  $('ep-ct').textContent = eps.length + ' episodes';
  renderEps(eps, $('ep-list'));
  showView('detail');
}

// ── Podcast detail (real API episodes) ───────────────────────────
async function openPodcastAPI(p) {
  $('det-header').innerHTML = `
    <div class="pdh">
      <div class="pdh-art" style="background:${p.bg || 'linear-gradient(135deg,#F97316,#c2410c)'};">
        ${p.artwork ? `<img src="${p.artwork}" style="width:100%;height:100%;object-fit:cover;" />` : '🎙️'}
      </div>
      <div class="pdh-info">
        <div class="pdh-t">${H(p.title)}</div>
        <div class="pdh-a">${H(p.author || '')}</div>
        <button class="btn-go fav-detail-btn ${isFav(p.id) ? 'saved' : ''}" data-pid="${p.id}" style="margin-top:10px;padding:5px 13px;font-size:12px;border-radius:99px;"
          onclick="toggleFav(${J(p)});">
          ${isFav(p.id) ? '♥ Saved' : '♡ Save'}
        </button>
      </div>
    </div>
    ${renderPodDesc(p.description)}`;
  $('ep-list').innerHTML = '<div class="loading"><div class="spin"></div></div>';
  showView('detail');
  try {
    const r = await fetch(`/api/episodes?feedId=${p.itunesId}&max=20`);
    const d = await r.json();
    const eps = (d.items || []).map(ep => ({
      id: ep.id, title: ep.title,
      date: new Date(ep.datePublished * 1000).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}),
      dur: fmtDur(ep.duration), src: ep.enclosureUrl,
      podcastTitle: p.title, podcastEmoji: '🎙️',
      podcastBg: p.bg || 'linear-gradient(135deg,#F97316,#c2410c)',
      artwork: p.artwork,
      description: stripHTML(ep.description),
    }));
    $('ep-ct').textContent = eps.length + ' episodes';
    renderEps(eps, $('ep-list'));
  } catch (e) {
    renderEps(MOCK_EPS({id:p.id, title:p.title, emoji:'🎙️', bg:'linear-gradient(135deg,#F97316,#c2410c)'}), $('ep-list'));
  }
}

function renderPodDesc(desc) {
  const text = stripHTML(desc);
  if (!text) return '';
  const long = text.length > 220;
  return `
    <div class="pdh-desc${long ? '' : ' expanded'}" id="pdh-desc">
      <div class="pdh-desc-text">${H(text)}</div>
      ${long ? `<button class="pdh-desc-toggle" onclick="togglePodDesc(this)">MORE</button>` : ''}
    </div>`;
}

function togglePodDesc(btn) {
  const wrap = btn.closest('.pdh-desc');
  const expanded = wrap.classList.toggle('expanded');
  btn.textContent = expanded ? 'LESS' : 'MORE';
}

function toggleEpNotes(id, btn) {
  const panel = $('ec-notes-' + id);
  if (!panel) return;
  const open = panel.hasAttribute('hidden');
  if (open) panel.removeAttribute('hidden');
  else panel.setAttribute('hidden', '');
  btn.classList.toggle('open', open);
}

function fmtDur(s) { if (!s) return ''; const h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return h ? `${h}h ${m}m` : `${m} min`; }

function renderEps(eps, container) {
  container.innerHTML = `<div class="el">${eps.map(ep => `
    <div class="ec-wrap">
      <div class="ec ${S.cur?.id === ep.id ? 'playing' : ''} ${isDone(ep.id) ? 'played' : ''}" id="ec-${ep.id}">
        <div class="ec-thumb" style="background:${ep.podcastBg || 'var(--surface2)'};">
          ${ep.artwork
            ? `<img src="${ep.artwork}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />`
            : (ep.podcastEmoji || '🎙️')}
        </div>
        <div class="ec-info" onclick='playEp(${J(ep)})'>
          <div class="ec-t">${H(ep.title)}</div>
          <div class="ec-m">
            <span>${H(ep.date || '')}</span>
            ${ep.dur ? `<span>·</span><span>${H(ep.dur)}</span>` : ''}
            ${isDone(ep.id) ? '<span class="played-tag"><i class="fa-solid fa-circle-check"></i> Played</span>' : ''}
          </div>
        </div>
        <div class="ec-acts">
          ${ep.description ? `<button class="eb ec-notes-toggle" onclick="event.stopPropagation();toggleEpNotes('${ep.id}',this)" title="Show notes">
            <i class="fa-solid fa-chevron-down"></i>
          </button>` : ''}
          <button class="eb ${isDone(ep.id) ? 'on' : ''}" onclick="event.stopPropagation();markPlayed(${J(ep)},this)" title="Mark played">
            <i class="fa-${isDone(ep.id) ? 'solid' : 'regular'} fa-circle-check"></i>
          </button>
          <button class="eb" onclick="event.stopPropagation();addQ(${J(ep)})" title="Add to queue">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
      ${ep.description ? `<div class="ec-notes" id="ec-notes-${ep.id}" hidden>${H(ep.description)}</div>` : ''}
    </div>`).join('')}</div>`;
}

// ── Search ────────────────────────────────────────────────────────
async function doSearch() {
  const q = $('si').value.trim();
  if (!q) return;
  saveSH(q);
  showView('search');
  $('srch-title').textContent = `"${q}"`;
  $('srch-body').innerHTML = '<div class="loading"><div class="spin"></div></div>';
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    const feeds = d.feeds || [];
    if (!feeds.length) {
      $('srch-body').innerHTML = '<div class="empty-st"><i class="fa-solid fa-magnifying-glass"></i><p>No results found</p></div>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'pg';
    grid.innerHTML = feeds.map(p => {
      const pd = {id:p.id, title:p.title, author:p.author, artwork:p.artwork||p.image, itunesId:p.itunesId, bg:'linear-gradient(135deg,#F97316,#c2410c)', description:p.description||''};
      return `<div class="pc" onclick='openPodcastAPI(${J(pd)})'>
        <div class="pc-art-wrap">
          ${pd.artwork
            ? `<img class="pc-art" src="${pd.artwork}" loading="lazy" onerror="this.style.display='none'" />`
            : `<div class="pc-art-ph" style="background:${pd.bg};">🎙️</div>`}
          <button class="fav-btn ${isFav(p.id) ? 'on' : ''}" data-pid="${p.id}" onclick="event.stopPropagation();toggleFav(${J(pd)})">
            <i class="fa-${isFav(p.id) ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
        <div class="pc-body"><div class="pc-t">${p.title}</div><div class="pc-a">${p.author || ''}</div></div>
      </div>`;
    }).join('');
    $('srch-body').innerHTML = '';
    $('srch-body').appendChild(grid);
  } catch (e) {
    const grid = document.createElement('div');
    grid.className = 'pg';
    grid.innerHTML = S.trending.map(p => `
      <div class="pc" onclick='clickPodcast(${J(p)})'>
        <div class="pc-art-wrap">
          ${p.artwork
            ? `<img class="pc-art" src="${p.artwork}" loading="lazy" />`
            : `<div class="pc-art-ph" style="background:${p.bg || 'var(--surface2)'};">${p.emoji || '🎙️'}</div>`}
          <button class="fav-btn ${isFav(p.id) ? 'on' : ''}" data-pid="${p.id}" onclick="event.stopPropagation();toggleFav(${J(p)})">
            <i class="fa-${isFav(p.id) ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
        <div class="pc-body"><div class="pc-t">${p.title}</div><div class="pc-a">${p.author || ''}</div></div>
      </div>`).join('');
    $('srch-body').innerHTML = '';
    $('srch-body').appendChild(grid);
  }
}

function saveSH(q) { S.sh = [q, ...S.sh.filter(s => s !== q)].slice(0, 10); save('aw_sh', S.sh); renderSH(); }
function renderSH() {}
function loadHist(q) { if (!q) return; $('si').value = q; doSearch(); }

$('si').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

// ── Player ────────────────────────────────────────────────────────
function playEp(ep) {
  S.cur = ep;
  $('pl-title').textContent = ep.title;
  $('pl-show').textContent  = ep.podcastTitle || '';
  $('np-pill').classList.add('on');
  if (ep.artwork) {
    $('pl-art').src = ep.artwork;
    $('pl-art').style.display = 'block';
    $('pl-art-ph').style.display = 'none';
  } else {
    $('pl-art').style.display = 'none';
    $('pl-art-ph').textContent = ep.podcastEmoji || '🎧';
    $('pl-art-ph').style.display = 'flex';
  }
  audio.pause();
  if (ep.src) {
    audio.src = ep.src;
    audio.play().then(() => { S.playing = true; updPlay(); }).catch(() => {});
  } else {
    audio.removeAttribute('src');
    audio.load();
    S.playing = false;
    updPlay();
  }
  document.querySelectorAll('.waveform').forEach(w => w.classList.toggle('on', S.playing));
  addHist(ep);
  document.querySelectorAll('.ec').forEach(c => c.classList.remove('playing'));
  const card = $('ec-' + ep.id);
  if (card) card.classList.add('playing');
  savePS();
}

function togglePlay() {
  if (!S.cur) return;
  if (S.playing) { audio.pause(); S.playing = false; }
  else { audio.play().catch(() => {}); S.playing = true; }
  updPlay();
  document.querySelectorAll('.waveform').forEach(w => w.classList.toggle('on', S.playing));
}
function updPlay() { $('play-icon').className = S.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'; }
function skip(s)   { if (audio.src) audio.currentTime = Math.max(0, audio.currentTime + s); }
function seekAudio(e) { const r = $('prog-bar').getBoundingClientRect(); if (audio.duration) audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration; }
function setSpeed(s) { S.speed = s; audio.playbackRate = s; document.querySelectorAll('.spd').forEach(b => b.classList.toggle('on', parseFloat(b.dataset.s) === s)); }
function setVol(v) { S.vol = v; S.muted = false; audio.volume = v / 100; audio.muted = false; $('vs').style.setProperty('--vp', v + '%'); updVI(v); }
function toggleMute() { S.muted = !S.muted; audio.muted = S.muted; updVI(S.muted ? 0 : S.vol); }
function updVI(v) { $('vol-icon').className = v == 0 ? 'fa-solid fa-volume-xmark' : v < 50 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high'; }

audio.addEventListener('timeupdate', () => {
  const d = audio.duration || 0, c = audio.currentTime || 0;
  $('prog-fill').style.width = (d ? (c / d * 100) : 0) + '%';
  $('t-cur').textContent = fT(c);
  $('t-tot').textContent = fT(d);
  if (Math.floor(c) % 5 === 0) savePS();
});
audio.addEventListener('ended', () => {
  S.playing = false; updPlay();
  document.querySelectorAll('.waveform').forEach(w => w.classList.remove('on'));
  if (S.cur) markPlayed(S.cur);
  playNext();
});

// ── Queue ─────────────────────────────────────────────────────────
function addQ(ep) {
  if (S.queue.find(q => q.id === ep.id)) { toast('Already in queue'); return; }
  S.queue.push(ep); save('aw_q', S.queue); renderQ(); toast('Added to queue ✓');
}
function rmQ(id)  { S.queue = S.queue.filter(q => q.id !== id); save('aw_q', S.queue); renderQ(); }
function playNext() { if (!S.queue.length) return; const n = S.queue.shift(); save('aw_q', S.queue); playEp(n); renderQ(); }

function renderQ() {
  const p = $('panel-queue');
  if (!S.queue.length) {
    p.innerHTML = '<div class="empty-st"><i class="fa-solid fa-headphones"></i><p>Queue is empty</p><p style="margin-top:3px;font-size:12px;">Tap + on any episode</p></div>';
    return;
  }
  p.innerHTML = S.queue.map(ep => `
    <div class="qi ${S.cur?.id === ep.id ? 'playing' : ''}">
      <div class="qi-th" style="background:${ep.podcastBg || 'var(--surface2)'};">
        ${ep.artwork ? `<img src="${ep.artwork}" style="width:100%;height:100%;object-fit:cover;" />` : (ep.podcastEmoji || '🎙️')}
      </div>
      <div class="qi-inf" onclick='playEp(${J(ep)})'>
        <div class="qi-t">${ep.title}</div>
        <div class="qi-m">${ep.podcastTitle || ''}</div>
      </div>
      <button class="qi-rm" onclick="rmQ('${ep.id}')"><i class="fa-solid fa-xmark"></i></button>
    </div>`).join('');
}

// ── Favorites ─────────────────────────────────────────────────────
function toggleFav(p) {
  if (isFav(p.id)) { S.favs = S.favs.filter(f => f.id !== p.id); }
  else { S.favs.push(p); }
  save('aw_favs', S.favs);
  renderFavs();
  renderTrending(S.trending);
  renderNewFromFavs();
  const on = isFav(p.id);
  document.querySelectorAll(`.fav-btn[data-pid="${p.id}"]`).forEach(btn => {
    btn.classList.toggle('on', on);
    const i = btn.querySelector('i');
    if (i) i.className = `fa-${on ? 'solid' : 'regular'} fa-heart`;
  });
  document.querySelectorAll(`.fav-detail-btn[data-pid="${p.id}"]`).forEach(btn => {
    btn.classList.toggle('saved', on);
    btn.textContent = on ? '♥ Saved' : '♡ Save';
  });
}

function renderFavs() {
  const p = $('panel-favs');
  if (!S.favs.length) {
    p.innerHTML = '<div class="empty-st"><i class="fa-regular fa-heart"></i><p>No favorites yet</p><p style="margin-top:3px;font-size:12px;">Tap ♥ on any podcast</p></div>';
    return;
  }
  p.innerHTML = S.favs.map(f => `
    <div class="qi" onclick='clickPodcast(${J(f)})'>
      <div class="qi-th" style="background:${f.bg || f.podcastBg || 'var(--surface2)'};">
        ${f.artwork ? `<img src="${f.artwork}" style="width:100%;height:100%;object-fit:cover;" />` : (f.emoji || f.podcastEmoji || '🎙️')}
      </div>
      <div class="qi-inf">
        <div class="qi-t">${f.title}</div>
        <div class="qi-m">${f.author || f.podcastTitle || ''}</div>
      </div>
      <button class="qi-rm" onclick="event.stopPropagation();toggleFav(${J(f)})">
        <i class="fa-solid fa-heart" style="color:var(--pink);"></i>
      </button>
    </div>`).join('');
}

// ── Played ────────────────────────────────────────────────────────
function markPlayed(ep, btn) {
  if (isDone(ep.id)) { S.played = S.played.filter(p => p !== ep.id); }
  else { S.played.push(ep.id); }
  save('aw_done', S.played);
  const card = $('ec-' + ep.id);
  if (card) {
    card.classList.toggle('played', isDone(ep.id));
    const meta = card.querySelector('.ec-m');
    const ex = meta?.querySelector('.played-tag');
    if (isDone(ep.id) && meta && !ex) meta.insertAdjacentHTML('beforeend', '<span class="played-tag"><i class="fa-solid fa-circle-check"></i> Played</span>');
    else if (!isDone(ep.id) && ex) ex.remove();
    if (btn) {
      btn.classList.toggle('on', isDone(ep.id));
      btn.querySelector('i').className = `fa-${isDone(ep.id) ? 'solid' : 'regular'} fa-circle-check`;
    }
  }
}

// ── History ───────────────────────────────────────────────────────
function addHist(ep) {
  S.hist = [{...ep, at: new Date().toISOString()}, ...S.hist.filter(h => h.id !== ep.id)].slice(0, 50);
  save('aw_hist', S.hist);
  renderHist();
}

function renderHist() {
  const p = $('panel-hist');
  if (!S.hist.length) {
    p.innerHTML = '<div class="empty-st"><i class="fa-solid fa-clock-rotate-left"></i><p>Nothing played yet</p></div>';
    return;
  }
  p.innerHTML = S.hist.map(ep => `
    <div class="qi" onclick='playEp(${J(ep)})'>
      <div class="qi-th" style="background:${ep.podcastBg || 'var(--surface2)'};">
        ${ep.artwork ? `<img src="${ep.artwork}" style="width:100%;height:100%;object-fit:cover;" />` : (ep.podcastEmoji || '🎙️')}
      </div>
      <div class="qi-inf">
        <div class="qi-t">${ep.title}</div>
        <div class="qi-m">${ep.podcastTitle || ''} · ${new Date(ep.at).toLocaleDateString()}</div>
      </div>
    </div>`).join('');
}

// ── Player collapse (mobile) ──────────────────────────────────────
function togglePlayerCollapse() {
  const sb = document.getElementById('sidebar');
  const collapsed = sb.classList.toggle('collapsed');
  const icon = document.getElementById('player-toggle-icon');
  if (icon) icon.className = collapsed ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
}

// ── Tabs ──────────────────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.sbt').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.sbp').forEach(p => p.classList.remove('on'));
  btn.classList.add('on');
  $('panel-' + name).classList.add('on');
}

// ── Toast ─────────────────────────────────────────────────────────
function toast(msg, ms = 2800) {
  const w = $('tw'), t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; w.appendChild(t);
  setTimeout(() => { t.classList.add('out'); t.addEventListener('animationend', () => t.remove()); }, ms);
}

// ── Speed row ─────────────────────────────────────────────────────
function renderSpeedRow() {
  $('speed-row').innerHTML = [0.75, 1, 1.25, 1.5, 2].map(s =>
    `<button class="spd ${s === 1 ? 'on' : ''}" data-s="${s}" onclick="setSpeed(${s})">${s}×</button>`
  ).join('');
}

// ── Persist ───────────────────────────────────────────────────────
function savePS() { if (S.cur) save('aw_ps', {ep: S.cur, t: audio.currentTime}); }

// ── Play latest episode from a favourite podcast ──────────────────
async function playLatestFromFav(p) {
  if (!p.itunesId) { toast('No episodes available'); return; }
  toast('Loading episode…');
  try {
    const r = await fetch(`/api/episodes?feedId=${p.itunesId}&max=1`);
    const d = await r.json();
    const items = d.items || [];
    if (!items.length) { toast('No episodes found'); return; }
    const ep = items[0];
    if (!ep.enclosureUrl) { toast('No audio available for latest episode'); return; }
    playEp({
      id: ep.id,
      title: ep.title,
      date: new Date(ep.datePublished * 1000).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}),
      dur: fmtDur(ep.duration),
      src: ep.enclosureUrl,
      podcastTitle: p.title,
      podcastEmoji: '🎙️',
      podcastBg: p.bg || p.podcastBg || 'var(--surface2)',
      artwork: p.artwork,
    });
  } catch (e) {
    toast('Failed to load episode');
  }
}

// ── New from Saved Podcasts ───────────────────────────────────────
const NEW_EP_TITLES = [
  'The Episode Everyone Is Talking About',
  'Breaking: What Just Happened',
  "A Deep Dive You Won't Regret",
  "This Week's Must-Listen",
  'Exclusive: An Interview You Need to Hear',
  "The Follow-Up We've All Been Waiting For",
];

function renderNewFromFavs() {
  const strip   = $('new-eps-strip');
  const countEl = $('new-eps-count');
  if (!S.favs.length) {
    strip.innerHTML = `<div class="nep-empty"><i class="fa-regular fa-bookmark"></i><span>Save podcasts to see new episodes here — tap ♥ on any show.</span></div>`;
    countEl.textContent = '';
    return;
  }
  countEl.textContent = `${S.favs.length} new`;
  strip.innerHTML = `<div class="new-eps-strip">${S.favs.map((p, i) => {
    const ep = {
      id: `nep-${p.id}`,
      title: NEW_EP_TITLES[i % NEW_EP_TITLES.length],
      date: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i + 1} days ago`,
      dur: `${28 + (i * 7) % 40} min`,
      src: '',
      podcastTitle: p.title,
      podcastEmoji: p.emoji || '🎙️',
      podcastBg: p.bg || p.podcastBg || 'var(--surface2)',
      artwork: p.artwork,
    };
    return `
    <div class="nep-card">
      <div class="nep-top">
        <div class="nep-emoji" style="background:${ep.podcastBg};">
          ${ep.artwork ? `<img src="${ep.artwork}" style="width:100%;height:100%;object-fit:cover;" />` : ep.podcastEmoji}
        </div>
        <div>
          <div class="nep-show">${ep.podcastTitle}</div>
          <div class="nep-date">${ep.date}</div>
        </div>
      </div>
      <div class="nep-title">${ep.title}</div>
      <div class="nep-actions">
        <button class="nep-btn nep-play" onclick='playLatestFromFav(${J(p)})'>
          <i class="fa-solid fa-play"></i> Play
        </button>
        <button class="nep-btn nep-queue" onclick='addQ(${J(ep)})'>
          <i class="fa-solid fa-plus"></i> Queue
        </button>
      </div>
    </div>`;
  }).join('')}</div>`;
}

// ── Trending fetch ────────────────────────────────────────────────
async function fetchTrending() {
  try {
    const r = await fetch('/api/trending');
    const d = await r.json();
    if (d.feeds && d.feeds.length) {
      S.trending = d.feeds.map(f => ({
        id: f.id,
        title: f.title,
        author: f.author || '',
        artwork: f.artwork || f.image || '',
        itunesId: f.itunesId,
        bg: 'linear-gradient(135deg,#F97316,#c2410c)',
        cat: f.categories ? Object.values(f.categories)[0] : '',
        description: f.description || '',
      }));
    }
  } catch (e) {
    // Keep TRENDING_FALLBACK already in S.trending
  }
  renderHero();
  renderTrending(S.trending);
}

// ── Keyboard shortcuts ────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); skip(-15); }
  if (e.code === 'ArrowRight') { e.preventDefault(); skip(30); }
  if (e.key === 'm' || e.key === 'M') toggleMute();
});

// ── Init ──────────────────────────────────────────────────────────
(function init() {
  renderSpeedRow();
  renderCats();
  renderQ();
  renderFavs();
  renderHist();
  renderSH();
  renderNewFromFavs();
  audio.volume = S.vol / 100;

  fetchTrending(); // async: replaces fallback with real data, re-renders hero + grid

  const ps = JSON.parse(localStorage.getItem('aw_ps') || 'null');
  if (ps && ps.ep) {
    S.cur = ps.ep;
    $('pl-title').textContent = ps.ep.title;
    $('pl-show').textContent  = ps.ep.podcastTitle || '';
    $('np-pill').classList.add('on');
    if (ps.ep.artwork) {
      $('pl-art').src = ps.ep.artwork;
      $('pl-art').style.display = 'block';
      $('pl-art-ph').style.display = 'none';
    } else {
      $('pl-art-ph').textContent = ps.ep.podcastEmoji || '🎧';
    }
    if (ps.ep.src) { audio.src = ps.ep.src; audio.currentTime = ps.t || 0; }
  }
})();

// ── Service worker ────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {});
}
