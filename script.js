const config = window.GIFT_CONFIG;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = [...document.querySelectorAll('.scene')];
const bouquet = document.querySelector('#bouquet');
const hint = document.querySelector('#bouquet-hint');
const dialog = document.querySelector('#letter-dialog');
const sealedLetter = document.querySelector('#sealed-letter');
const unsealLetter = document.querySelector('#unseal-letter');
const letterContent = document.querySelector('#letter-content');
let letterTimer;
const galaxy = document.querySelector('#galaxy');
let step = 0;
let transitionTimer;
let loadingTimer;
let soundOn = false;
let musicEnabled = true;
let musicAttempt = 0;
const audio = new Audio(config.music.src);
audio.preload = 'metadata';
audio.volume = .65;
const musicStart = config.music.startAt;
const soundButton = document.querySelector('#sound');
audio.addEventListener('loadedmetadata', () => { audio.currentTime = musicStart; });

function updateSoundButton() {
  soundButton.setAttribute('aria-pressed', String(musicEnabled));
  soundButton.setAttribute('aria-label', musicEnabled ? 'Tắt nhạc Ngày hạnh phúc' : 'Phát nhạc Ngày hạnh phúc');
  soundButton.title = musicEnabled ? 'Tắt nhạc' : 'Ngày hạnh phúc · phát từ giây 10';
}

async function startMusic() {
  if (!musicEnabled || document.hidden) return;
  const attempt = ++musicAttempt;
  try {
    if (audio.readyState >= 1 && audio.currentTime < musicStart) audio.currentTime = musicStart;
    await audio.play();
    if (attempt !== musicAttempt) return;
    soundOn = true;
  } catch {
    if (attempt !== musicAttempt) return;
    soundOn = false;
  }
  updateSoundButton();
}

audio.addEventListener('ended', () => {
  audio.currentTime = musicStart;
  if (musicEnabled) startMusic();
});
audio.addEventListener('error', () => { soundOn = false; musicEnabled = false; updateSoundButton(); });
updateSoundButton();

document.title = `Dành cho ${config.recipient} ♡`;
document.querySelector('.dedication h1').textContent = config.recipient;
document.querySelector('.galaxy-caption h2').textContent = `${config.recipient} ♡`;
document.querySelector('.letter h2').replaceChildren('Gửi cậu,', document.createElement('br'), config.recipient);

function scene(id) {
  scenes.forEach(element => {
    const active = element.id === id;
    element.classList.toggle('active', active);
    element.inert = !active;
    element.setAttribute('aria-hidden', String(!active));
  });
}

const svgNS = 'http://www.w3.org/2000/svg';
function svgElement(type, attributes) {
  const element = document.createElementNS(svgNS, type);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}
// Layered petals, leaves and tiny white blooms form the bouquet without remote assets.
const rosePositions = [[139,168,42],[201,140,45],[262,170,42],[116,222,35],[183,223,46],[254,230,39],[205,285,35]];
rosePositions.forEach(([x,y,r], index) => {
  const rose = svgElement('g', { transform: `translate(${x} ${y}) rotate(${index*37})` });
  for(let ring=0;ring<5;ring++) {
    const radius = r*(1-ring*.17);
    for(let petal=0;petal<6;petal++) {
      rose.append(svgElement('ellipse', { cx:0,cy:-radius*.33,rx:radius*.64,ry:radius*.63,fill:'url(#petal)',stroke:'#ce85a5','stroke-width':'.65', transform:`rotate(${petal*60+ring*28})` }));
    }
  }
  document.querySelector('#roses').append(rose);
});
for(let i=0;i<20;i++) {
  const angle=i*2.399, x=200+Math.cos(angle)*(70+i*2.2), y=211+Math.sin(angle)*(75+i*1.6);
  document.querySelector('#leaves').append(svgElement('ellipse',{cx:x,cy:y,rx:12,ry:29,fill:i%2?'#7d9875':'#5a745e',transform:`rotate(${i*43} ${x} ${y})`}));
  for(let j=0;j<6;j++) document.querySelector('#baby-breath').append(svgElement('circle',{cx:x+Math.cos(j*1.3)*15,cy:y+Math.sin(j*1.3)*17,r:2+j%2,fill:'#fff3e9'}));
}

function photoContent(parent, index) {
  if(config.photos.length) {
    const img=document.createElement('img');
    const photoIndex = index % config.photos.length;
    img.src=config.photos[photoIndex]; img.alt=`${config.recipient} — ảnh ${photoIndex+1}`;
    img.style.objectPosition = config.photoPositions?.[photoIndex] || '50% 40%';
    img.decoding = 'async';
    parent.append(img);
  } else {
    const heart=document.createElement('span'); heart.className='placeholder-heart'; heart.textContent='♡'; parent.append(heart);
  }
}
[[19,18,-14],[40,12,-2],[61,20,13],[24,36,-9],[45,34,3],[63,38,12]].forEach(([left,top,angle],i)=>{
  const photo=document.createElement('div'); photo.className='bloom-photo';
  photo.style.cssText=`--left:${left}%;--top:${top}%;--angle:${angle}deg;--delay:${i*.12}s`;
  photoContent(photo,i);document.querySelector('#photo-blooms').append(photo);
});
photoContent(document.querySelector('#letter-photo'),0);

// One card per distinct photo; never cycle image indexes inside the galaxy.
const uniquePhotoIndexes = config.photos.reduce((indexes, source, index) => {
  if (!indexes.some(previous => config.photos[previous] === source)) indexes.push(index);
  return indexes;
}, []);
uniquePhotoIndexes.forEach((photoIndex, index) => {
  const card = document.createElement('div');
  card.className = 'floating-item floating-photo';
  const column = index % 3;
  const row = Math.floor(index / 3);
  const rows = Math.ceil(uniquePhotoIndexes.length / 3);
  card.style.cssText = `--x:${12 + column * 30 + (row % 2) * 4}%;--y:${18 + row * (65 / Math.max(rows - 1, 1))}%;--duration:${24 + index % 5}s;--delay:-${index * 2.3 + 4}s;--opacity:.9;--photo-size:${100 + index % 3 * 16}px`;
  photoContent(card, photoIndex);
  galaxy.append(card);
});

for(let i=0;i<30;i++) {
  const element=document.createElement('div');
  const type=i%3===0?'heart-particle':'wish';
  element.className=`floating-item ${type}`;
  const size=10+(i*7%13);
  element.style.cssText=`--x:${6+(i*37%87)}%;--y:${6+(i*23%83)}%;--size:${size}px;--duration:${17+i%12}s;--delay:-${i*1.71}s;--opacity:${.4+(i%6)*.1};--photo-size:${60+i%4*16}px`;
  element.textContent=type==='heart-particle'?'♥':config.wishes[i%config.wishes.length];
  galaxy.append(element);
}

function reset() {
  clearTimeout(transitionTimer);clearTimeout(loadingTimer);
  step=0;bouquet.classList.remove('photo-mode','burst');
  hint.textContent='Chạm vào bó hoa nhé ♡';
  if(dialog.open)dialog.close();
  scene('loading');
  loadingTimer=setTimeout(()=>scene('bouquet-scene'),2600);
}
bouquet.addEventListener('click',()=>{
  if(step===0){step=1;bouquet.classList.add('photo-mode');hint.textContent='Còn một bất ngờ nữa… chạm thêm lần nữa ♡';}
  else if(step===1){step=2;bouquet.classList.add('burst');hint.textContent='';transitionTimer=setTimeout(()=>scene('universe'),1100);}
});
document.querySelector('#replay').addEventListener('click',reset);
document.querySelector('#open-letter').addEventListener('click',()=>{
  clearTimeout(letterTimer);
  sealedLetter.hidden = false;
  sealedLetter.classList.remove('unsealing');
  unsealLetter.disabled = false;
  unsealLetter.setAttribute('aria-expanded', 'false');
  letterContent.hidden = true;
  dialog.showModal();
  unsealLetter.focus();
});
unsealLetter.addEventListener('click',()=>{
  unsealLetter.disabled = true;
  unsealLetter.setAttribute('aria-expanded', 'true');
  sealedLetter.classList.add('unsealing');
  letterTimer = setTimeout(()=>{
    sealedLetter.hidden = true;
    letterContent.hidden = false;
    document.querySelector('#close-letter').focus();
  }, reducedMotion ? 0 : 850);
});
dialog.addEventListener('close',()=>clearTimeout(letterTimer));
document.querySelector('#close-letter').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});

let dragging=false, lastX=0,lastY=0,rx=0,ry=0,zoom=1;
const universe=document.querySelector('#universe');
universe.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;dragging=true;lastX=event.clientX;lastY=event.clientY;universe.setPointerCapture(event.pointerId);});
universe.addEventListener('pointermove',event=>{if(!dragging)return;ry=Math.max(-25,Math.min(25,ry+(event.clientX-lastX)*.12));rx=Math.max(-20,Math.min(20,rx-(event.clientY-lastY)*.1));lastX=event.clientX;lastY=event.clientY;galaxy.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) scale(${zoom})`;});
['pointerup','pointercancel'].forEach(name=>universe.addEventListener(name,()=>dragging=false));
universe.addEventListener('wheel',event=>{event.preventDefault();zoom=Math.max(.75,Math.min(1.5,zoom-event.deltaY*.0005));galaxy.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg) scale(${zoom})`;},{passive:false});

soundButton.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  if (!musicEnabled) {
    musicAttempt++;
    soundOn = false;
    audio.pause();
    updateSoundButton();
  } else { updateSoundButton(); startMusic(); }
});
// Browsers may require a gesture before audible playback; respect an explicit mute.
function unlockMusic(event) {
  if (event.target instanceof Element && event.target.closest('#sound')) return;
  if (musicEnabled && !soundOn) startMusic();
}
document.addEventListener('pointerdown', unlockMusic, { capture: true });
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') unlockMusic(event);
}, { capture: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { musicAttempt++; soundOn = false; audio.pause(); }
  else if (musicEnabled) startMusic();
});
startMusic();

const canvas=document.querySelector('#stars'),ctx=canvas.getContext('2d');
let width,height,stars=[];
function resize(){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);stars=Array.from({length:Math.min(470,Math.round(width*height/1900))},()=>({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.1+.2,a:Math.random(),speed:Math.random()*.1+.025}));}
let lastFrame=0;
function draw(time){if(time-lastFrame>30){lastFrame=time;ctx.clearRect(0,0,width,height);stars.forEach(star=>{if(!reducedMotion){star.y-=star.speed;if(star.y<0)star.y=height;}const alpha=.25+(Math.sin(time*.001+star.a*12)+1)*.3;ctx.fillStyle=`rgba(255,207,230,${alpha})`;ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();if(star.r>1.1){ctx.shadowColor='#ff99cc';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;}});}requestAnimationFrame(draw);}
addEventListener('resize',resize);resize();requestAnimationFrame(draw);reset();
