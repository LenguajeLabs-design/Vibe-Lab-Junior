import type { GenerationInput, GenerationResult, PlayableProject } from "./types";

const sharedCss = `
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,sans-serif;color:#17324d;overflow:hidden}
.game{position:relative;min-height:100vh;padding:20px;text-align:center;background:linear-gradient(#c8f1ff,#f8fdff)}
h1{margin:0 0 6px;font-size:clamp(24px,5vw,42px)}p{margin:4px auto 12px;max-width:520px}
.hud{display:flex;justify-content:center;gap:18px;font-weight:800;font-size:18px}
.stage{position:relative;width:min(94vw,680px);height:min(62vh,430px);margin:14px auto 0;border:4px solid #17324d;border-radius:24px;background:#fff;overflow:hidden;box-shadow:0 10px 0 #17324d22}
.player,.target{position:absolute;display:grid;place-items:center;user-select:none}.player{bottom:12px;font-size:56px}.target{top:-60px;font-size:42px}
.tip{font-size:14px;font-weight:700}
`;

const catchGame: PlayableProject = {
  title: "Penguin Ice Cream Catch",
  summary: "Move the penguin to catch falling ice cream and earn points.",
  html: `<main class="game"><h1>Penguin Ice Cream Catch</h1><p>Catch as many treats as you can!</p><div class="hud"><span id="score">Score: 0</span><span id="time">Time: 30</span></div><div class="stage" id="stage"><div class="target" id="target">🍦</div><div class="player" id="player">🐧</div></div><p class="tip">Use the arrow keys or move your pointer.</p></main>`,
  css: sharedCss,
  js: `const stage=document.querySelector('#stage');const player=document.querySelector('#player');const target=document.querySelector('#target');const scoreEl=document.querySelector('#score');const timeEl=document.querySelector('#time');let x=280,tx=100,ty=-50,score=0,time=30;function clamp(n,a,b){return Math.max(a,Math.min(b,n))}function movePlayer(){player.style.left=x+'px'}function resetTarget(){tx=Math.random()*(stage.clientWidth-50);ty=-55;target.style.left=tx+'px'}addEventListener('keydown',e=>{if(e.key==='ArrowLeft')x-=30;if(e.key==='ArrowRight')x+=30;x=clamp(x,0,stage.clientWidth-65);movePlayer()});stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();x=clamp(e.clientX-r.left-30,0,stage.clientWidth-65);movePlayer()});function loop(){ty+=3;target.style.top=ty+'px';const a=player.getBoundingClientRect(),b=target.getBoundingClientRect();if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top){score++;scoreEl.textContent='Score: '+score;resetTarget()}if(ty>stage.clientHeight)resetTarget();requestAnimationFrame(loop)}movePlayer();resetTarget();loop();setInterval(()=>{if(time>0){time--;timeEl.textContent='Time: '+time}},1000);`,
  learningNotes: [
    { label: "Arrow controls", explanation: "A key listener moves the penguin left and right." },
    { label: "Falling treat", explanation: "The animation loop moves the ice cream a little farther down each frame." },
    { label: "Scoring", explanation: "The score grows when the penguin and ice cream touch." },
  ],
};

const quiz: PlayableProject = {
  title: "Ocean Animal Quiz",
  summary: "Choose the right ocean animal and build a streak.",
  html: `<main class="quiz"><p class="eyebrow">Ocean explorer quiz</p><h1 id="question">Which animal has eight arms?</h1><div id="answers" class="answers"></div><p id="result">Pick your answer!</p><p id="score">Stars: 0</p></main>`,
  css: `*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;font-family:system-ui,sans-serif;background:radial-gradient(circle at top,#b8f3ff,#725bff);color:#112744}.quiz{width:min(92vw,650px);padding:clamp(24px,6vw,54px);text-align:center;background:#fff;border:4px solid #112744;border-radius:30px;box-shadow:0 14px 0 #11274433}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-weight:900;color:#5b43d6}.answers{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:24px 0}.answer{padding:18px;border:3px solid #112744;border-radius:18px;background:#e8fbff;font:800 18px system-ui;cursor:pointer}.answer:hover{transform:translateY(-2px);background:#fff2a8}#result,#score{font-weight:800}`,
  js: `const questions=[['Which animal has eight arms?',['Octopus','Dolphin','Crab','Whale'],0],['Which animal has a hard shell?',['Jellyfish','Sea turtle','Shark','Seal'],1],['Which animal is the biggest?',['Blue whale','Clownfish','Seahorse','Starfish'],0]];let n=0,score=0;const q=document.querySelector('#question'),answers=document.querySelector('#answers'),result=document.querySelector('#result'),scoreEl=document.querySelector('#score');function show(){const item=questions[n%questions.length];q.textContent=item[0];answers.textContent='';item[1].forEach((text,i)=>{const b=document.createElement('button');b.className='answer';b.textContent=text;b.addEventListener('click',()=>{if(i===item[2]){score++;result.textContent='Correct! Great exploring.'}else result.textContent='Good try! The answer is '+item[1][item[2]]+'.';scoreEl.textContent='Stars: '+score;n++;setTimeout(show,850)});answers.appendChild(b)})}show();`,
  learningNotes: [
    { label: "Question list", explanation: "Each quiz item stores a question, answer choices, and the correct choice." },
    { label: "Answer buttons", explanation: "JavaScript creates a button for every choice." },
    { label: "Stars", explanation: "The stars number grows whenever the correct answer is picked." },
  ],
};

const spaceToy: PlayableProject = {
  title: "Planet Motion Lab",
  summary: "Press the space button to launch planets into colorful new orbits.",
  html: `<main class="space"><div class="stars"></div><h1>Planet Motion Lab</h1><p>Press the launch pad and watch the solar system dance.</p><div class="orbit" id="orbit"><span class="sun">☀️</span><span class="planet one">🌎</span><span class="planet two">🪐</span><span class="planet three">🔴</span></div><button id="launch">Launch the planets</button></main>`,
  css: `*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;background:#100c3f;color:#fff}.space{min-height:100vh;display:grid;place-items:center;align-content:center;gap:8px;text-align:center;padding:20px;background:radial-gradient(circle at 50% 55%,#41319c,#100c3f 60%)}h1{font-size:clamp(30px,7vw,58px);margin:0}.orbit{position:relative;width:min(74vw,430px);aspect-ratio:1;border:2px dashed #ffffff55;border-radius:50%;margin:18px}.sun,.planet{position:absolute;font-size:48px}.sun{left:50%;top:50%;transform:translate(-50%,-50%)}.planet{left:50%;top:50%;transform-origin:0 0}.one{--r:130px}.two{--r:185px}.three{--r:90px}.moving .one{animation:spin 3s linear infinite}.moving .two{animation:spin 6s linear infinite reverse}.moving .three{animation:spin 2s linear infinite}@keyframes spin{from{transform:rotate(0) translateX(var(--r)) rotate(0)}to{transform:rotate(360deg) translateX(var(--r)) rotate(-360deg)}}button{border:0;border-radius:999px;padding:17px 26px;background:#ffd94a;color:#24184f;font:900 18px system-ui;box-shadow:0 7px 0 #f09038;cursor:pointer}button:active{transform:translateY(4px);box-shadow:0 3px 0 #f09038}`,
  js: `const orbit=document.querySelector('#orbit');const launch=document.querySelector('#launch');let moving=false;launch.addEventListener('click',()=>{moving=!moving;orbit.classList.toggle('moving',moving);launch.textContent=moving?'Pause the planets':'Launch the planets'});`,
  learningNotes: [
    { label: "Launch button", explanation: "A click listener starts or pauses the planets." },
    { label: "Orbits", explanation: "CSS animations rotate each planet around the sun." },
    { label: "Different speeds", explanation: "Each planet uses a different animation time." },
  ],
};

const blockPuzzle: PlayableProject = {
  title: "Falling Block Builder",
  summary: "Move and rotate falling shapes to complete rows and score points.",
  html: `<main class="blocks"><div><h1>Falling Block Builder</h1><p>Complete rows before the blocks reach the top.</p><div class="hud"><span id="score">Score: 0</span><span id="status">Playing</span></div></div><canvas id="board" width="300" height="540"></canvas><div class="controls"><button id="left">◀ Left</button><button id="turn">↻ Turn</button><button id="right">Right ▶</button><button id="down">▼ Drop</button></div><p>Keyboard: arrows to move, ↑ to rotate.</p></main>`,
  css: `*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,sans-serif;background:linear-gradient(135deg,#211653,#4936a7);color:#fff}.blocks{min-height:100vh;display:grid;place-items:center;align-content:center;gap:12px;padding:18px;text-align:center}h1{margin:0;font-size:clamp(28px,6vw,48px)}p{margin:4px}.hud{display:flex;justify-content:center;gap:24px;font-weight:900}canvas{width:min(78vw,300px);height:auto;max-height:58vh;background:#0d1230;border:5px solid #fff;border-radius:14px;box-shadow:0 10px 0 #0004}.controls{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:min(94vw,520px)}button{border:0;border-radius:14px;padding:13px 8px;background:#ffd84a;color:#211653;font:900 16px system-ui;box-shadow:0 5px 0 #e58b2a;cursor:pointer}button:active{transform:translateY(3px);box-shadow:0 2px 0 #e58b2a}`,
  js: `const canvas=document.querySelector('#board'),ctx=canvas.getContext('2d'),scoreEl=document.querySelector('#score'),statusEl=document.querySelector('#status'),cols=10,rows=18,size=30,colors=['#0000','#ff4f81','#55d6ff','#ffd84a','#8d73ff','#63df8d','#ff934f','#ef63e8'];let grid=Array.from({length:rows},()=>Array(cols).fill(0)),score=0,last=0,over=false;const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];function piece(){const n=1+Math.floor(Math.random()*7);return{x:3,y:0,c:n,s:shapes[n-1]}}let active=piece();function hit(p,dx=0,dy=0,s=p.s){return s.some((row,y)=>row.some((v,x)=>v&&(p.x+x+dx<0||p.x+x+dx>=cols||p.y+y+dy>=rows||p.y+y+dy>=0&&grid[p.y+y+dy][p.x+x+dx])))}function merge(){active.s.forEach((row,y)=>row.forEach((v,x)=>{if(v&&active.y+y>=0)grid[active.y+y][active.x+x]=active.c}));let cleared=0;grid=grid.filter(row=>{if(row.every(Boolean)){cleared++;return false}return true});while(grid.length<rows)grid.unshift(Array(cols).fill(0));score+=cleared*100;scoreEl.textContent='Score: '+score;active=piece();if(hit(active)){over=true;statusEl.textContent='Game over — refresh to retry'}}function move(dx,dy){if(over)return;if(!hit(active,dx,dy)){active.x+=dx;active.y+=dy}else if(dy)merge();draw()}function turn(){if(over)return;const rotated=active.s[0].map((_,i)=>active.s.map(row=>row[i]).reverse());if(!hit(active,0,0,rotated))active.s=rotated;draw()}function drawCell(x,y,c){ctx.fillStyle=colors[c];ctx.fillRect(x*size+2,y*size+2,size-4,size-4);ctx.strokeStyle='#ffffff55';ctx.strokeRect(x*size+2,y*size+2,size-4,size-4)}function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);grid.forEach((row,y)=>row.forEach((v,x)=>v&&drawCell(x,y,v)));active.s.forEach((row,y)=>row.forEach((v,x)=>v&&drawCell(active.x+x,active.y+y,active.c)))}function loop(t){if(!over&&t-last>650){move(0,1);last=t}requestAnimationFrame(loop)}addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(-1,0);if(e.key==='ArrowRight')move(1,0);if(e.key==='ArrowDown')move(0,1);if(e.key==='ArrowUp')turn()});document.querySelector('#left').addEventListener('click',()=>move(-1,0));document.querySelector('#right').addEventListener('click',()=>move(1,0));document.querySelector('#down').addEventListener('click',()=>move(0,1));document.querySelector('#turn').addEventListener('click',turn);draw();requestAnimationFrame(loop);`,
  learningNotes: [
    { label: "Grid", explanation: "The board is a grid where each number stores an empty space or a colored block." },
    { label: "Collision checks", explanation: "Before moving, the game checks walls, the floor, and blocks already on the board." },
    { label: "Completed rows", explanation: "A full row disappears, new empty rows are added at the top, and the score grows." },
  ],
};

export function getDemoResult(input: GenerationInput): GenerationResult {
  const text = input.idea.toLowerCase();
  let project = text.includes("tetris") || text.includes("falling block") || text.includes("block puzzle")
    ? blockPuzzle
    : text.includes("quiz") || text.includes("ocean")
    ? quiz
    : text.includes("space") || text.includes("planet")
      ? spaceToy
      : catchGame;

  if (input.action !== "create" && input.currentProject) {
    const actionLabel = input.action === "add" ? "Added idea" : input.action === "change" ? "Changed idea" : "Fix checked";
    project = {
      ...input.currentProject,
      summary: `${input.currentProject.summary} ${actionLabel}: ${input.idea.slice(0, 80)}.`,
      learningNotes: [
        ...input.currentProject.learningNotes.slice(0, 4),
        { label: actionLabel, explanation: "This demo update keeps the working project safe while showing the requested next step." },
      ],
    };
  }

  return {
    project: structuredClone(project),
    warnings: ["Demo project shown while the creative helper was unavailable."],
  };
}