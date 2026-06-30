const DATA = window.TRIP_DATA;
const $ = (id) => document.getElementById(id);
const state = { plan: 'A', day: 0, map: null, markers: [], line: null, selected: null, schematic: false };
const place = (id) => DATA.places[id];
const plan = () => DATA.plans[state.plan];
const day = () => plan().days[state.day];
const routeIds = () => day().route;
const routePlaces = () => routeIds().map(place);

function init() {
  renderAll();
  initMap();
  $('fitBtn').onclick = fitRoute;
  $('fullBtn').onclick = () => $('map').requestFullscreen?.();
  $('copyBtn').onclick = copyDay;
  $('gaodeRouteBtn').onclick = openGaodeRoute;
  $('appleRouteBtn').onclick = openAppleRoute;
}

function renderAll() {
  renderTabs();
  renderDays();
  renderSummary();
  renderDailyFoodSpot();
  renderRouteList();
  renderTimeline();
  renderMeals();
  renderFoodCards();
  renderSpotCards();
}

function renderTabs() {
  const box = $('planTabs');
  box.innerHTML = '';
  Object.entries(DATA.plans).forEach(([key, p]) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (key === state.plan ? ' active' : '');
    btn.innerHTML = `<b>${p.title}</b><span>${p.tag}</span>`;
    btn.onclick = () => { state.plan = key; state.day = 0; state.selected = null; renderAll(); drawRoute(); };
    box.appendChild(btn);
  });
}

function renderDays() {
  const box = $('dayChips');
  box.innerHTML = '';
  plan().days.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (i === state.day ? ' active' : '');
    btn.textContent = `D${i + 1}`;
    btn.title = d.title;
    btn.onclick = () => { state.day = i; state.selected = null; renderAll(); drawRoute(); };
    box.appendChild(btn);
  });
}

function renderSummary() {
  $('planBox').innerHTML = `<b>${plan().tag}</b><br>${plan().desc}<br><br><b>${day().title}</b><br>${day().note}`;
}

function renderDailyFoodSpot() {
  const routeNames = routePlaces().filter(p => !['交通', '住宿', '补给/晚饭'].includes(p.type)).map(p => p.name).join(' / ') || '别墅休整';
  $('dailyFoodSpot').innerHTML = `
    <div class="mini-card"><b>今日景点</b><span>${routeNames}</span></div>
    <div class="mini-card"><b>午饭</b><span>${day().meals.lunch}</span></div>
    <div class="mini-card"><b>晚饭</b><span>${day().meals.dinner}</span></div>`;
}

function renderRouteList() {
  const box = $('routeList');
  box.innerHTML = '';
  routeIds().forEach((id, i) => {
    const p = place(id);
    const el = document.createElement('article');
    el.className = 'stop' + (state.selected === id ? ' active' : '');
    el.innerHTML = `
      <span class="num">${i + 1}</span>
      <div>
        <b>${p.name}</b>
        <small>${p.type}｜建议停留 ${p.duration}<br>${p.note}<br>停车：${p.parking}</small>
        <div class="links">
          <a href="${gaodePlace(p)}" target="_blank" rel="noreferrer">打开高德</a>
          <a href="${applePlace(p)}" target="_blank" rel="noreferrer">Apple Maps</a>
        </div>
      </div>`;
    el.onclick = (e) => { if (e.target.tagName === 'A') return; selectPlace(id); };
    box.appendChild(el);
  });
}

function renderTimeline() {
  $('timeline').innerHTML = day().timeline.map(([time, text]) => `<div class="time"><b>${time}</b><p>${text}</p></div>`).join('');
}

function renderMeals() {
  const meals = day().meals;
  $('mealBox').innerHTML = `
    <div class="meal"><b>午饭</b><span>${meals.lunch}</span></div>
    <div class="meal"><b>晚饭</b><span>${meals.dinner}</span></div>
    <div class="meal"><b>补给</b><span>${meals.snack}</span></div>`;
}

function renderFoodCards() {
  $('foodCards').innerHTML = DATA.foods.map(f => `
    <article class="card"><b>${f.name}</b><span>地点：${f.where}<br>适合：${f.best}<br>${f.tip}</span></article>`).join('');
}

function renderSpotCards() {
  $('spotCards').innerHTML = DATA.spots.map(s => `
    <article class="card"><b>${s.name}</b><span>优势：${s.strength}<br>注意：${s.risk}</span></article>`).join('');
}

function initMap() {
  if (window.L) {
    state.map = L.map('map', { scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);
    drawRoute();
  } else {
    state.schematic = true;
    renderSchematic();
  }
}

function drawRoute() {
  if (!state.map || state.schematic) return renderSchematic();
  state.markers.forEach(m => m.remove());
  state.markers = [];
  if (state.line) state.line.remove();
  const latlngs = routePlaces().map(p => [p.lat, p.lng]);
  routePlaces().forEach((p, i) => {
    const marker = L.marker([p.lat, p.lng])
      .addTo(state.map)
      .bindPopup(`<b>${i + 1}. ${p.name}</b><br>${p.type}<br>${p.note}<br><br><a target="_blank" rel="noreferrer" href="${gaodePlace(p)}">打开高德</a> · <a target="_blank" rel="noreferrer" href="${applePlace(p)}">Apple Maps</a>`);
    marker.on('click', () => { state.selected = routeIds()[i]; renderRouteList(); });
    state.markers.push(marker);
  });
  state.line = L.polyline(latlngs, { color: '#f97316', weight: 5, opacity: 0.9 }).addTo(state.map);
  fitRoute();
  setStatus(`<b>${plan().title}</b>｜${day().title}<br>${routePlaces().map(p => p.name).join(' → ')}<br>${day().note}`);
}

function renderSchematic() {
  const map = $('map');
  map.innerHTML = '<div class="schematic"><div class="lake"></div><svg class="route-svg" id="routeSvg"></svg></div><div class="status" id="status"></div>';
  const svg = $('routeSvg');
  const pts = routePlaces().map(p => `${p.x},${p.y}`).join(' ');
  svg.innerHTML = `<polyline class="route-line" points="${pts}" vector-effect="non-scaling-stroke" />`;
  routePlaces().forEach((p, i) => {
    const pin = document.createElement('div');
    pin.className = 'pin' + (state.selected === routeIds()[i] ? ' active' : '');
    pin.style.left = p.x + '%';
    pin.style.top = p.y + '%';
    pin.onclick = () => selectPlace(routeIds()[i]);
    map.appendChild(pin);
    const label = document.createElement('div');
    label.className = 'pin-label';
    label.style.left = p.x + '%';
    label.style.top = p.y + '%';
    label.textContent = `${i + 1}. ${p.name}`;
    map.appendChild(label);
  });
  setStatus(`<b>示意图模式</b>｜Leaflet 加载失败时显示。<br>${routePlaces().map(p => p.name).join(' → ')}`);
}

function selectPlace(id) {
  state.selected = id;
  renderRouteList();
  const p = place(id);
  if (state.map && !state.schematic) {
    const i = routeIds().indexOf(id);
    state.map.setView([p.lat, p.lng], 13);
    state.markers[i]?.openPopup();
  } else {
    renderSchematic();
  }
}

function fitRoute() {
  if (!state.map || state.schematic) return;
  state.map.fitBounds(L.latLngBounds(routePlaces().map(p => [p.lat, p.lng])), { padding: [45, 45] });
}

function setStatus(html) { const s = $('status'); if (s) s.innerHTML = html; }

function gaodePlace(p) {
  return `https://uri.amap.com/marker?position=${p.lng},${p.lat}&name=${encodeURIComponent(p.name)}&coordinate=gaode&callnative=1`;
}
function applePlace(p) {
  return `https://maps.apple.com/?ll=${p.lat},${p.lng}&q=${encodeURIComponent(p.name)}`;
}
function openGaodeRoute() {
  const r = routePlaces(), a = r[0], b = r[r.length - 1];
  window.open(`https://uri.amap.com/navigation?from=${a.lng},${a.lat},${encodeURIComponent(a.name)}&to=${b.lng},${b.lat},${encodeURIComponent(b.name)}&mode=car&policy=1&coordinate=gaode&callnative=1`, '_blank', 'noopener');
}
function openAppleRoute() {
  const r = routePlaces(), a = r[0], b = r[r.length - 1];
  window.open(`https://maps.apple.com/?saddr=${a.lat},${a.lng}&daddr=${b.lat},${b.lng}&dirflg=d`, '_blank', 'noopener');
}
function dayText() {
  return `${plan().title}｜${day().title}\n路线：${routePlaces().map(p => p.name).join(' → ')}\n午饭：${day().meals.lunch}\n晚饭：${day().meals.dinner}\n备注：${day().note}`;
}
async function copyDay() {
  try { await navigator.clipboard.writeText(dayText()); toast('已复制当天路线'); }
  catch { toast('复制失败，可手动选择文字'); }
}
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1600); }

document.addEventListener('DOMContentLoaded', init);
