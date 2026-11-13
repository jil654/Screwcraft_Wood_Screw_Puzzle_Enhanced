import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Trophy, Lock, ArrowRight, Pause, Play, Home, Grid3X3, Info, Star, Timer, Hammer, Check, X } from 'lucide-react';
import './index.css';

const COLORS = ['#e7a33e','#55a7d8','#b17bd4','#62b98b'];
const LEVELS = Array.from({length:12}, (_,i) => {
  const count = Math.min(4 + Math.floor(i/2), 9);
  const cols = Math.min(2 + Math.floor(i/3), 4);
  const holes = Array.from({length:count+Math.max(2,Math.floor(count/2))},(_,j)=>({
    id:`h${j}`, x: 15 + (j%4)*23, y: 15 + Math.floor(j/4)*23
  }));
  const screws = Array.from({length:count},(_,j)=>({
    id:`s${j}`, holeId:holes[j].id, color:COLORS[j%cols]
  }));
  const boxes = Array.from({length:cols},(_,j)=>({
    color:COLORS[j], capacity:screws.filter(s=>s.color===COLORS[j]).length, filled:0
  }));
  const planks = Array.from({length:Math.min(2+Math.floor(i/3),4)},(_,j)=>({
    id:`p${j}`, x: j%2===0?8:12, y: 13+j*21, width:j%2===0?84:76,
    height:18, rotation: j%2===0?0:(i%2===0?0:0),
    color:['#bd8955','#a87343','#d2a16a','#98643d'][j%4],
    name:['OAK','WALNUT','MAPLE','CEDAR'][j%4],
    holes: holes.filter((_,k)=>k%planksCount(count)===j%planksCount(count)).map(h=>h.id)
  }));
  return {id:i+1,name:['Workshop Warm-up','Oakwood Tangle','Crossbeam Challenge','Copperwood','The Carpenter’s Knot','Timber Twist','Workshop Maze','Four-Way Lock','Master Joiner','The Screwsmith','Grand Workshop','Legendary Builder'][i],
    holes, screws, boxes, planks, time:Math.max(75,150-i*5), coins:100+i*25};
});
function planksCount(n){return Math.min(2+Math.floor((n-4)/3),4)}
function Screw({screw, selected, moving, collecting}) {
  return <span aria-label={`Screw ${screw.id}`} className={`screw ${selected?'selected':''} ${moving?'moving':''} ${collecting?'collecting':''}`} style={{'--metal':screw.color}}>
    <span className="screw-rim"><span className="screw-face"><i className="slot slot-a"/><i className="slot slot-b"/><i className="screw-dot"/></span></span>
  </span>;
}
function App(){
  const [level,setLevel]=useState(0);
  const [progress,setProgress]=useState(()=>{try{return JSON.parse(localStorage.getItem('screwcraft-progress'))||{unlocked:1,coins:250,completed:[]}}catch{return {unlocked:1,coins:250,completed:[]}}});
  const {unlocked,coins,completed}=progress;
  const [tab,setTab]=useState('game'), [sound,setSound]=useState(true), [paused,setPaused]=useState(false);
  const data=LEVELS[level];
  const [screws,setScrews]=useState(data.screws);
  const [boxes,setBoxes]=useState(data.boxes);
  const [selected,setSelected]=useState(null);
  const [dropped,setDropped]=useState([]);
  const [time,setTime]=useState(data.time);
  const [won,setWon]=useState(false), [lost,setLost]=useState(false);
  const [moves,setMoves]=useState(0), [message,setMessage]=useState('Select a screw to get started');
  const [animating,setAnimating]=useState(false), [loadedLevel,setLoadedLevel]=useState(0);
  const [movingId,setMovingId]=useState(null), [collectingId,setCollectingId]=useState(null);
  const timer=useRef(null);
  useEffect(()=>{try{localStorage.setItem('screwcraft-progress',JSON.stringify(progress))}catch{}},[progress]);
  const active= !won&&!lost&&!paused&&tab==='game';
  const occupied=useMemo(()=>new Set(screws.map(s=>s.holeId)),[screws]);
  const play=(freq=520)=>{
    if(!sound)return;
    try{const C=window.AudioContext||window.webkitAudioContext;const c=new C();const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=freq;g.gain.setValueAtTime(.07,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.start();o.stop(c.currentTime+.12);o.onended=()=>c.close()}catch{}
  };
  const reset=()=>{
    setScrews(data.screws.map(s=>({...s})));setBoxes(data.boxes.map(b=>({...b,filled:0})));
    setSelected(null);setDropped([]);setTime(data.time);setWon(false);setLost(false);setPaused(false);setMoves(0);setMessage('Select a screw to get started');setAnimating(false);setMovingId(null);setCollectingId(null);
  };
  useEffect(()=>{reset();},[level]);
  useEffect(()=>{
    if(!active)return;
    timer.current=setInterval(()=>setTime(t=>{if(t<=1){setLost(true);return 0}return t-1}),1000);
    return ()=>clearInterval(timer.current);
  },[active]);
  useEffect(()=>{
    if(screws.length===0&&!won){setWon(true);setProgress(p=>({unlocked:Math.max(p.unlocked,level+2),coins:p.coins+data.coins,completed:p.completed.includes(level)?p.completed:[...p.completed,level]}));setMessage('Beautiful work. Every screw is collected!');play(780)}
  },[screws.length]);
  useEffect(()=>{
    const next=data.planks.filter(p=>!dropped.includes(p.id)&&!p.holes.some(h=>screws.some(s=>s.holeId===h)));
    if(next.length)setDropped(v=>[...v,...next.map(p=>p.id)]);
  },[screws,loadedLevel,level]);
  const collect=(s)=>{
    const boxIndex=boxes.findIndex(b=>b.color===s.color&&b.filled<b.capacity);
    if(boxIndex<0){setMessage('That colour tray is full. Try another move.');return}
    setAnimating(true);setCollectingId(s.id);setMessage('Screw collected');play(680);
    setTimeout(()=>{
      setScrews(v=>v.filter(x=>x.id!==s.id));
      setBoxes(v=>v.map((b,i)=>i===boxIndex?{...b,filled:b.filled+1}:b));
      setSelected(null);setMoves(m=>m+1);setAnimating(false);setCollectingId(null);
    },260);
  };
  const clickHole=(hole)=>{
    if(!active||animating)return;
    const screw=screws.find(s=>s.holeId===hole.id);
    if(screw){
      if(selected===screw.id){collect(screw);return}
      setSelected(screw.id);setMessage('Tap the selected screw again to remove it, or choose an empty hole to move it.');play();
      return;
    }
    if(selected){
      setAnimating(true);play(420);
      setTimeout(()=>{
        setScrews(v=>v.map(s=>s.id===selected?{...s,holeId:hole.id}:s));
        setMovingId(selected);
        setSelected(null);setMoves(m=>m+1);setAnimating(false);setMessage('Screw moved. Keep freeing the boards.');
        setTimeout(()=>setMovingId(null),420);
      },220);
    }else setMessage('Choose a screw first, then tap an empty hole to move it.');
  };
  const next=()=>{if(level<LEVELS.length-1){setLevel(v=>v+1);setTab('game')}else{setTab('map')}};
  const chooseLevel=(n)=>{if(n<unlocked){setLevel(n);setTab('game')}};
  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Hammer size={22}/></div><div><b>SCREW<span>CRAFT</span></b><small>THE WOOD PUZZLE</small></div></div>
      <div className="top-actions"><div className="coin-pill">✦ {coins.toLocaleString()}</div><button className="icon-btn" onClick={()=>setSound(v=>!v)} aria-label="Toggle sound">{sound?<Volume2/>:<VolumeX/>}</button></div>
    </header>
    <nav className="tabs">
      <button className={tab==='game'?'active':''} onClick={()=>setTab('game')}><Grid3X3 size={16}/> Puzzle</button>
      <button className={tab==='map'?'active':''} onClick={()=>setTab('map')}><Home size={16}/> Level map</button>
      <button className={tab==='rules'?'active':''} onClick={()=>setTab('rules')}><Info size={16}/> How to play</button>
    </nav>
    {tab==='game'&&<section className="game-layout">
      <div className="game-heading"><div><span className="eyebrow">WORKSHOP • LEVEL {data.id}</span><h1>{data.name}</h1><p>Remove every screw and clear the timber.</p></div>
        <div className="heading-actions"><div className={`timer ${time<20?'urgent':''}`}><Timer size={16}/>{Math.floor(time/60)}:{String(time%60).padStart(2,'0')}</div><button className="icon-btn" onClick={()=>setPaused(true)} title="Pause"><Pause size={17}/></button><button className="icon-btn" onClick={reset} title="Restart"><RotateCcw size={17}/></button></div>
      </div>
      <div className="stats-row"><div><small>SCREWS LEFT</small><b>{screws.length} <span>/ {data.screws.length}</span></b></div><div className="progress"><div style={{width:`${(data.screws.length-screws.length)/data.screws.length*100}%`}}/></div><div><small>MOVES</small><b>{moves}</b></div></div>
      <div className="tray-row">{boxes.map((b,i)=><div className="tray" key={i}><div className="tray-head"><span><i style={{background:b.color}}/>{['BRASS','BLUE STEEL','VIOLET','JADE'][i]}</span><b>{b.filled}/{b.capacity}</b></div><div className="tray-slots">{Array.from({length:b.capacity},(_,j)=><span key={j} className={j<b.filled?'filled':''} style={{'--metal':b.color}}>{j<b.filled&&<i/>}</span>)}</div></div>)}</div>
      <div className="board-wrap"><div className="board">
        <div className="board-grain"/>
        {data.planks.map(p=><div key={p.id} className={`plank ${dropped.includes(p.id)?'fallen':''}`} style={{left:`${p.x}%`,top:`${p.y}%`,width:`${p.width}%`,height:`${p.height}%`,backgroundColor:p.color}}><span>{p.name}</span><i/><i/></div>)}
        {data.holes.map(h=>{const s=screws.find(x=>x.holeId===h.id);return <div key={h.id} className="hole-position" style={{left:`${h.x}%`,top:`${h.y}%`}}><button className={`hole ${selected&&s?.id===selected?'target':''}`} onClick={()=>clickHole(h)} aria-label={s?'Select screw':'Empty hole'}><span className="hole-inner"/>{s&&<Screw screw={s} selected={selected===s.id} moving={movingId===s.id} collecting={collectingId===s.id}/>}</button></div>})}
      </div></div>
      <div className="hint"><span className="hint-icon">✦</span><span>{message}</span><span className="hint-count">{screws.length} remaining</span></div>
      {won&&<div className="overlay"><div className="result-card"><div className="result-icon"><Trophy size={34}/></div><span className="eyebrow">WORKSHOP CLEARED</span><h2>Level complete!</h2><p>You collected every screw in {moves} moves.</p><div className="reward">✦ +{data.coins} coins earned</div><button className="primary-btn" onClick={next}>{level===LEVELS.length-1?'View level map':'Next level'} <ArrowRight size={18}/></button><button className="text-btn" onClick={()=>setTab('map')}>Back to level map</button></div></div>}
      {lost&&<div className="overlay"><div className="result-card"><div className="result-icon danger"><X size={32}/></div><h2>Time’s up</h2><p>Take a breath and give this puzzle another try.</p><button className="primary-btn" onClick={reset}><RotateCcw size={18}/> Try again</button></div></div>}
      {paused&&<div className="overlay"><div className="result-card"><div className="result-icon"><Pause size={32}/></div><h2>Game paused</h2><p>Your workshop is waiting.</p><button className="primary-btn" onClick={()=>setPaused(false)}><Play size={18}/> Resume</button><button className="text-btn" onClick={reset}>Restart level</button></div></div>}
    </section>}
    {tab==='map'&&<section className="map-page"><div className="page-title"><span className="eyebrow">YOUR JOURNEY</span><h1>Workshop map</h1><p>Complete each build to unlock the next challenge.</p></div><div className="level-grid">{LEVELS.map((l,i)=><button key={l.id} disabled={i>=unlocked} onClick={()=>chooseLevel(i)} className={`level-card ${i<unlocked?'open':''} ${i===level?'current':''}`}><div className="level-number">{i<unlocked?<span>{i+1}</span>:<Lock size={17}/>}</div><b>{l.name}</b><small>{completed.includes(i)?'COMPLETED':i<unlocked?'UNLOCKED':'LOCKED'}</small>{completed.includes(i)&&<div className="level-stars"><Star/><Star/><Star/></div>}</button>)}</div></section>}
    {tab==='rules'&&<section className="rules-page"><div className="page-title"><span className="eyebrow">QUICK GUIDE</span><h1>How to play</h1><p>Think ahead. Every hole is a possible move.</p></div><div className="rule-list"><article><span>01</span><div><b>Select a screw</b><p>Tap a screw once to select it. It will lift and glow.</p></div></article><article><span>02</span><div><b>Move or collect</b><p>Tap an empty hole to move the selected screw. Tap the selected screw again to collect it into its matching colour tray.</p></div></article><article><span>03</span><div><b>Clear the timber</b><p>When a plank has no screws holding it, it drops away automatically.</p></div></article><article><span>04</span><div><b>Finish before time runs out</b><p>Collect every screw before the timer reaches zero to unlock the next level.</p></div></article></div></section>}
    <footer><span>SCREWCRAFT <i>•</i> A LITTLE THINKING GOES A LONG WAY</span><span>LEVEL {level+1} / {LEVELS.length}</span></footer>
  </main>
}

export default App