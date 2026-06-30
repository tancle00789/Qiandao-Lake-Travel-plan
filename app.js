const DATA=window.TRIP_DATA;
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const state={plan:'A',day:0,provider:params.get('provider')||'leaflet',map:null,markers:[],line:null,selected:null};
const place=id=>DATA.places[id], plan=()=>DATA.plans[state.plan], day=()=>plan().days[state.day];

function init(){
  renderControls();
  $('providerSelect').value=state.provider;
  $('providerSelect').onchange=e=>switchProvider(e.target.value);
  $('fitBtn').onclick=fit;
  $('fullBtn').onclick=()=>$('map').requestFullscreen?.();
  $('copyBtn').onclick=copyRoute;
  $('navBtn').onclick=openAmapNav;
  startMap();
}

function renderControls(){
  $('planTabs').innerHTML='';
  Object.entries(DATA.plans).forEach(([key,p])=>{
    const b=document.createElement('button');
    b.className='tab'+(key===state.plan?' active':'');
    b.innerHTML=`<b>${p.title}</b><span>${p.tag}</span>`;
    b.onclick=()=>{state.plan=key;state.day=0;state.selected=null;renderControls();drawRoute()};
    $('planTabs').appendChild(b);
  });
  $('dayChips').innerHTML='';
  plan().days.forEach((d,i)=>{
    const b=document.createElement('button');
    b.className='chip'+(i===state.day?' active':'');
    b.textContent='D'+(i+1);
    b.title=d.title;
    b.onclick=()=>{state.day=i;state.selected=null;renderControls();drawRoute()};
    $('dayChips').appendChild(b);
  });
  $('planBox').innerHTML=`<b>${plan().tag}</b><br>${plan().desc}<br><br><b>${day().title}</b><br>${day().note}`;
  renderPlaces();
}

function renderPlaces(){
  const box=$('places'); box.innerHTML='';
  day().route.forEach((id,i)=>{
    const p=place(id), card=document.createElement('div');
    card.className='place'+(state.selected===id?' active':'');
    card.innerHTML=`<span class="num">${i+1}</span><span><b>${p.name}</b><small>${p.type}｜${p.note}</small></span><a class="open" href="${amapMarker(p)}" target="_blank" rel="noreferrer">高德</a>`;
    card.onclick=e=>{ if(e.target.tagName==='A') return; selectPlace(id); };
    box.appendChild(card);
  });
}

function switchProvider(p){
  state.provider=p; state.map=null; state.markers=[]; state.line=null;
  if(p==='amap' && !params.get('key')){setStatus('高德 JS API 需要在 URL 追加 <code>?provider=amap&key=你的Key&scode=安全密钥</code>。当前先显示示意图。'); return renderSchematic()}
  if(p==='baidu' && !params.get('ak')){setStatus('百度 WebGL API 需要在 URL 追加 <code>?provider=baidu&ak=你的AK</code>。当前先显示示意图。'); return renderSchematic()}
  startMap();
}
function startMap(){
  if(state.provider==='amap' && params.get('key')) return loadAMap();
  if(state.provider==='baidu' && params.get('ak')) return loadBaidu();
  if(state.provider==='schematic') return renderSchematic();
  if(window.L) return renderLeaflet();
  renderSchematic();
}
function resetMapNode(){ $('map').innerHTML='<div class="status" id="status"></div>'; }
function setStatus(html){ const s=$('status'); if(s) s.innerHTML=html; }
function routePlaces(){ return day().route.map(place); }
function routeText(){ return `${plan().title}｜${day().title}\n${routePlaces().map(p=>p.name).join(' → ')}\n${day().note}`; }

function renderLeaflet(){
  resetMapNode();
  state.map=L.map('map',{scrollWheelZoom:true});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(state.map);
  drawRoute();
}
function drawRoute(){
  renderControls();
  if(state.provider==='leaflet' && window.L && state.map) return drawLeaflet();
  if(state.provider==='amap' && window.AMap && state.map) return drawAMap();
  if(state.provider==='baidu' && window.BMapGL && state.map) return drawBaidu();
  return drawSchematic();
}
function drawLeaflet(){
  state.markers.forEach(m=>m.remove()); state.markers=[]; if(state.line) state.line.remove();
  const latlngs=routePlaces().map(p=>[p.lat,p.lng]);
  routePlaces().forEach((p,i)=>{
    const marker=L.marker([p.lat,p.lng]).addTo(state.map).bindPopup(`<b>${i+1}. ${p.name}</b><br>${p.type}<br>${p.note}<br><a target="_blank" rel="noreferrer" href="${amapMarker(p)}">打开高德地点</a>`);
    marker.on('click',()=>{state.selected=day().route[i];renderPlaces()});
    state.markers.push(marker);
  });
  state.line=L.polyline(latlngs,{color:'#f97316',weight:5,opacity:.9}).addTo(state.map);
  fit();
  setStatus(`<b>${plan().title}</b>｜${day().title}<br>${routePlaces().map(p=>p.name).join(' → ')}<br>${day().note}`);
}

function renderSchematic(){
  resetMapNode();
  $('map').insertAdjacentHTML('afterbegin','<div class="schematic"><div class="lake"></div><svg class="route-svg" id="routeSvg"></svg></div>');
  drawSchematic();
}
function drawSchematic(){
  if(!$('routeSvg')) renderSchematic();
  const map=$('map'); map.querySelectorAll('.pin,.pin-label').forEach(n=>n.remove());
  const svg=$('routeSvg'); if(!svg) return;
  const r=routePlaces(); svg.innerHTML=`<polyline class="route-line" points="${r.map(p=>`${p.x},${p.y}`).join(' ')}" vector-effect="non-scaling-stroke"/>`;
  r.forEach((p,i)=>{
    const pin=document.createElement('div'); pin.className='pin'+(state.selected===day().route[i]?' active':''); pin.style.left=p.x+'%'; pin.style.top=p.y+'%'; pin.onclick=()=>selectPlace(day().route[i]); map.appendChild(pin);
    const lab=document.createElement('div'); lab.className='pin-label'; lab.style.left=p.x+'%'; lab.style.top=p.y+'%'; lab.textContent=`${i+1}. ${p.name}`; map.appendChild(lab);
  });
  setStatus(`<b>示意图模式</b>｜${day().title}<br>${r.map(p=>p.name).join(' → ')}<br>${day().note}`);
}
function selectPlace(id){
  state.selected=id; renderPlaces();
  const p=place(id);
  if(state.provider==='leaflet' && state.map && window.L){ state.map.setView([p.lat,p.lng],13); const idx=day().route.indexOf(id); state.markers[idx]?.openPopup(); }
  if(state.provider==='schematic') drawSchematic();
}
function fit(){
  const r=routePlaces();
  if(state.provider==='leaflet' && state.map && window.L){ state.map.fitBounds(L.latLngBounds(r.map(p=>[p.lat,p.lng])),{padding:[45,45]}); return; }
  if(state.provider==='amap' && state.map && window.AMap) state.map.setFitView([...state.markers,state.line],false,[70,70,70,70]);
  if(state.provider==='baidu' && state.map && window.BMapGL) state.map.setViewport(r.map(p=>new BMapGL.Point(p.lng,p.lat)));
}
function loadScript(src,cb){ const s=document.createElement('script'); s.src=src; s.async=true; s.onload=cb; s.onerror=()=>{state.provider='schematic';renderSchematic()}; document.head.appendChild(s); }
function loadAMap(){
  resetMapNode(); const key=params.get('key'), scode=params.get('scode'); if(scode) window._AMapSecurityConfig={securityJsCode:scode};
  loadScript(`https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`,()=>{state.map=new AMap.Map('map',{zoom:10,center:[119.02,29.60]}); drawAMap()});
}
function drawAMap(){
  state.markers.forEach(m=>m.setMap(null)); state.markers=[]; if(state.line) state.line.setMap(null);
  const path=routePlaces().map(p=>[p.lng,p.lat]);
  routePlaces().forEach((p,i)=>{const m=new AMap.Marker({position:[p.lng,p.lat],label:{content:`${i+1}. ${p.name}`,direction:'top'}}); m.on('click',()=>new AMap.InfoWindow({content:`<b>${p.name}</b><br>${p.type}<br>${p.note}`}).open(state.map,[p.lng,p.lat])); m.setMap(state.map); state.markers.push(m)});
  state.line=new AMap.Polyline({path,strokeColor:'#f97316',strokeWeight:5}); state.line.setMap(state.map); fit(); setStatus(`已加载高德地图｜${day().title}`);
}
function loadBaidu(){
  resetMapNode(); const ak=params.get('ak');
  window.__initBaidu=()=>{state.map=new BMapGL.Map('map');state.map.centerAndZoom(new BMapGL.Point(119.02,29.60),10);state.map.enableScrollWheelZoom(true);drawBaidu()};
  loadScript(`https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${encodeURIComponent(ak)}&callback=__initBaidu`,()=>{});
}
function drawBaidu(){
  state.map.clearOverlays(); const pts=routePlaces().map(p=>new BMapGL.Point(p.lng,p.lat));
  routePlaces().forEach((p,i)=>{const m=new BMapGL.Marker(new BMapGL.Point(p.lng,p.lat));m.setLabel(new BMapGL.Label(`${i+1}. ${p.name}`,{offset:new BMapGL.Size(14,-28)}));m.addEventListener('click',()=>state.map.openInfoWindow(new BMapGL.InfoWindow(`<b>${p.name}</b><br>${p.type}<br>${p.note}`),new BMapGL.Point(p.lng,p.lat)));state.map.addOverlay(m)});
  state.map.addOverlay(new BMapGL.Polyline(pts,{strokeColor:'#f97316',strokeWeight:5,strokeOpacity:.9})); fit(); setStatus(`已加载百度地图｜${day().title}`);
}
function amapMarker(p){ return `https://uri.amap.com/marker?position=${p.lng},${p.lat}&name=${encodeURIComponent(p.name)}&coordinate=gaode&callnative=1`; }
function openAmapNav(){
  const r=routePlaces(), a=r[0], b=r[r.length-1];
  const url=`https://uri.amap.com/navigation?from=${a.lng},${a.lat},${encodeURIComponent(a.name)}&to=${b.lng},${b.lat},${encodeURIComponent(b.name)}&mode=car&policy=1&coordinate=gaode&callnative=1`;
  window.open(url,'_blank','noopener');
}
async function copyRoute(){ try{await navigator.clipboard.writeText(routeText()); toast('已复制当天路线')}catch{toast('复制失败，可手动选择文字')} }
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
document.addEventListener('DOMContentLoaded',init);