const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ls={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- algorithms ---------- */
function dpSolve(it,W){const n=it.length,T=Array.from({length:n+1},()=>Array(W+1).fill(0));
for(let i=1;i<=n;i++)for(let w=0;w<=W;w++){const{w:wt,v}=it[i-1];T[i][w]=wt>w?T[i-1][w]:Math.max(T[i-1][w],v+T[i-1][w-wt])}
let w=W;const sel=[];for(let i=n;i>0;i--)if(T[i][w]!==T[i-1][w]){sel.push(i-1);w-=it[i-1].w}
return{T,sel:sel.reverse(),best:T[n][W]}}
function greedy(it,W){const o=it.map((x,i)=>i).sort((a,b)=>it[b].v/it[b].w-it[a].v/it[a].w);let r=W,v=0,w=0;const sel=[];
for(const i of o)if(it[i].w<=r){r-=it[i].w;v+=it[i].v;w+=it[i].w;sel.push(i)}return{v,w,sel}}
function brute(it,W){let best=0,c=0;for(let m=0;m<1<<it.length;m++){c++;let w=0,v=0;for(let i=0;i<it.length;i++)if(m>>i&1){w+=it[i].w;v+=it[i].v}if(w<=W&&v>best)best=v}return{best,c}}
function fractional(it,W){const o=it.map((x,i)=>i).sort((a,b)=>it[b].v/it[b].w-it[a].v/it[a].w);let r=W,v=0;const f=it.map(()=>0);
for(const i of o){const t=Math.min(1,r/it[i].w);f[i]=t;r-=t*it[i].w;v+=t*it[i].v;if(r<=0)break}return{f,v}}
function countUp(el,to,d=700){const t0=performance.now();(function s(t){const p=Math.min(1,(t-t0)/d);el.textContent=Math.round(to*p);if(p<1)requestAnimationFrame(s)})(t0)}
function barRow(el,pct,over){el.style.width=Math.min(100,pct)+'%';el.className=over?'over':''}

/* ---------- hero loop ---------- */
(()=>{const pool=[['Book',3,4],['Laptop',4,9],['Coins',1,3],['Camera',3,7],['Phone',1,5],['Lamp',2,2]],HC=9;let bag=[],k=0;
function tick(){const nx=pool[k++%pool.length];bag.push(nx);while(bag.reduce((a,b)=>a+b[1],0)>HC)bag.shift();
$('#hbag').innerHTML=bag.map(b=>`<span class="chip">${b[0]}</span>`).join('');const w=bag.reduce((a,b)=>a+b[1],0);
barRow($('#hbar'),w/HC*100);$('#htxt').textContent=`Capacity used: ${w} / ${HC} kg`}
tick();setInterval(tick,1500)})();

/* ---------- learn demo ---------- */
(()=>{const L=[{n:'Book',w:3,v:5},{n:'Camera',w:4,v:9},{n:'Lamp',w:5,v:6},{n:'Coins',w:2,v:6},{n:'Tent',w:6,v:10}],C=10,sel=new Set();
$('#lc').textContent=C;
function draw(){$('#ldemo').innerHTML=L.map((x,i)=>`<button class="it ${sel.has(i)?'sel':''}" data-i="${i}">${esc(x.n)}<small>${x.w} kg, value ${x.v}</small></button>`).join('');
let w=0,v=0;sel.forEach(i=>{w+=L[i].w;v+=L[i].v});$('#lw').textContent=w;$('#lv').textContent=v;barRow($('#lbar'),w/C*100,w>C);
$('#lwarn').textContent=w>C?`Over by ${w-C} kg. Take something out.`:'';}
$('#ldemo').onclick=e=>{const b=e.target.closest('.it');if(!b)return;const i=+b.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);draw();
let w=0;sel.forEach(j=>w+=L[j].w);if(w>C){const bb=$(`#ldemo [data-i="${i}"]`);bb&&bb.classList.add('shake')}};draw()})();

/* ---------- types ---------- */
(()=>{const T=[{n:'Gold bar',w:6,v:30},{n:'Silk roll',w:5,v:20},{n:'Spices',w:4,v:12}],C=10;let mode='01';
function draw(){let f,v,txt;if(mode==='01'){const r=dpSolve(T,C);f=T.map((x,i)=>r.sel.includes(i)?1:0);v=r.best;txt=`Whole items only. Best choice is worth ${v}. The silk roll is rejected because the gold bar and spices use the capacity better.`}
else{const r=fractional(T,C);f=r.f;v=r.v;txt=`Sorted by ratio (${T.map(x=>(x.v/x.w).toFixed(1)).join(', ')}). The last item taken is cut to fit, so the total is ${v.toFixed(1)}.`}
$('#tbody').innerHTML=T.map((x,i)=>`<div class="fr"><span>${x.n} (${x.w}kg, ${x.v})</span><div class="bar"><i style="width:0" data-w="${f[i]*100}"></i></div><span>${f[i]===0?'rejected':f[i]===1?'whole':Math.round(f[i]*100)+'%'}</span></div>`).join('');
setTimeout(()=>$$('#tbody i').forEach(e=>e.style.width=e.dataset.w+'%'),30);
$('#tsum').textContent=txt;$('#tt').textContent=(mode==='01'?'0/1':'Fractional')+' result, capacity 10, total value '+(+v.toFixed(1))}
$('#m01').onclick=()=>{mode='01';$('#m01').className='on';$('#mfr').className='';draw()};
$('#mfr').onclick=()=>{mode='fr';$('#mfr').className='on';$('#m01').className='';draw()};draw()})();

/* ---------- simulator ---------- */
let S,uid=1;const mk=(n,w,v)=>({id:uid++,n,w,v});
const defaults=()=>({cap:5,items:[mk('Notebook',1,6),mk('Headphones',2,10),mk('Laptop',3,12)],pick:new Set()});
S=defaults();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Math.round(+x)||a));
function rows(){$('#cap').value=S.cap;$('#rows').innerHTML=S.items.map(x=>`<div class="row" data-id="${x.id}"><input type="checkbox" class="pk" ${S.pick.has(x.id)?'checked':''} aria-label="Pick ${esc(x.n)}"><input class="nm" value="${esc(x.n)}" data-f="n" aria-label="Name"><input type="number" min="1" value="${x.w}" data-f="w" aria-label="Weight" title="Weight"><input type="number" min="0" value="${x.v}" data-f="v" aria-label="Value" title="Value"><span class="ratio">${(x.v/x.w).toFixed(2)} v/w</span><button class="sm ghost del" aria-label="Delete">x</button></div>`).join('')||'<p class="why">No items yet. Add one to begin.</p>';
dpBuild();}
$('#rows').onchange=e=>{const r=e.target.closest('.row');if(!r)return;const x=S.items.find(i=>i.id==r.dataset.id);
if(e.target.classList.contains('pk')){e.target.checked?S.pick.add(x.id):S.pick.delete(x.id);return}
const f=e.target.dataset.f;x[f]=f==='n'?e.target.value.slice(0,16)||'Item':clamp(e.target.value,f==='w'?1:0,999);rows()};
$('#rows').onclick=e=>{if(!e.target.classList.contains('del'))return;const id=+e.target.closest('.row').dataset.id;S.items=S.items.filter(i=>i.id!==id);S.pick.delete(id);rows()};
$('#cap').onchange=e=>{S.cap=clamp(e.target.value,1,40);rows()};
$('#addI').onclick=()=>{if(S.items.length>=12)return alert('Twelve items is the limit here.');S.items.push(mk('Item '+(S.items.length+1),2,5));rows()};
$('#rst').onclick=()=>{S=defaults();$('#res').innerHTML='';rows()};
$('#poster').onclick=()=>{S={cap:10,items:[mk('Item 1',2,12),mk('Item 2',1,10),mk('Item 3',3,20),mk('Item 4',2,15)],pick:new Set()};$('#res').innerHTML='';rows();
$('#res').innerHTML='<div class="expl">Poster example loaded. Press Calculate. The poster lists items 1, 3 and 4 for a value of 47, but all four items weigh 8 kg in total and fit in 10 kg, so the real optimum is 57.</div>'};
$('#rndI').onclick=()=>{const nm=['Tent','Stove','Map','Rope','Boots','Radio','Torch','Flask','Jacket','Kettle'];const n=4+Math.floor(Math.random()*5);
S.items=Array.from({length:n},(_,i)=>mk(nm[i],1+Math.floor(Math.random()*9),2+Math.floor(Math.random()*40)));S.cap=8+Math.floor(Math.random()*13);S.pick=new Set();$('#res').innerHTML='';rows()};
$('#calc').onclick=()=>{if(!S.items.length)return;$('#ld').innerHTML='<span class="load"></span>';$('#res').innerHTML='';
setTimeout(()=>{$('#ld').textContent='';result()},450)};
function result(){const it=S.items,W=S.cap,r=dpSolve(it,W),g=greedy(it,W);const ids=r.sel;
const tw=ids.reduce((a,i)=>a+it[i].w,0);let mw=0,mv=0;it.forEach(x=>{if(S.pick.has(x.id)){mw+=x.w;mv+=x.v}});const mOK=mw<=W;
$$('.row').forEach((el,i)=>{el.classList.toggle('win',ids.includes(i));el.classList.toggle('lose',!ids.includes(i))});
const rej=it.map((x,i)=>ids.includes(i)?'':`<li><b>${esc(x.n)}</b>: ${x.w>W?`heavier (${x.w}) than the whole bag (${W}).`:x.v===0?'worth nothing.':`taking it would force out items worth more than its ${x.v}. Only ${W-tw} kg is left, it needs ${x.w}.`}</li>`).join('');
const mx=Math.max(r.best,g.v,mOK?mv:0,1);
$('#res').innerHTML=`<div class="grid g2"><div><h3>Optimal selection</h3><div class="bag" style="width:150px;height:170px;margin:30px auto 10px;border-radius:70px 70px 20px 20px"><div class="in" style="top:14px;height:140px;left:12px;right:12px">${ids.map((i,k)=>`<span class="chip" style="animation-delay:${k*.25}s;animation-fill-mode:backwards">${esc(it[i].n)}</span>`).join('')}</div></div>
<div class="cnt"><div>Total weight<br><b id="rW">0</b> / ${W}</div><div>Total value<br><b id="rV">0</b></div></div></div>
<div><h3>Why the others were left out</h3>${rej?`<ul class="why">${rej}</ul>`:'<p class="why">Nothing was rejected. Everything fits.</p>'}
<h3>Head to head</h3><div class="cmp">
<div class="l"><span>Your pick</span><div class="bar"><i class="${mOK?'':'over'}" style="width:${(mOK?mv:mv)/mx*100}%"></i></div><b>${S.pick.size?(mOK?mv:'over'):'none'}</b></div>
<div class="l"><span>Greedy</span><div class="bar"><i style="width:${g.v/mx*100}%"></i></div><b>${g.v}</b></div>
<div class="l"><span>Dynamic prog.</span><div class="bar"><i style="width:${r.best/mx*100}%;background:var(--ok)"></i></div><b>${r.best}</b></div></div>
<p class="why">${g.v<r.best?`Greedy loses ${r.best-g.v} here because chasing the best ratio first wastes space.`:'Greedy happened to match the optimum on these items.'} ${S.pick.size?(mOK?(mv<r.best?`You are ${r.best-mv} short of optimal.`:'Your pick is optimal.'):`Your pick weighs ${mw}, over the limit of ${W}.`):'Tick items on the left to compare your own combination.'}</p></div></div>`;
countUp($('#rW'),tw);countUp($('#rV'),r.best);dpGoto(S.items.length*S.cap)}

/* ---------- DP visualiser ---------- */
let D={steps:[],k:0,T:null,timer:null};
function dpBuild(){clearInterval(D.timer);D.timer=null;$('#dpPlay').textContent='Play animation';const it=S.items,W=S.cap,r=dpSolve(it,W);D.T=r.T;D.steps=[];
for(let i=1;i<=it.length;i++)for(let w=1;w<=W;w++)D.steps.push([i,w]);D.k=0;$('#dpSl').max=D.steps.length;$('#dpSl').value=0;dpDraw()}
function dpDraw(){const it=S.items,W=S.cap,n=it.length,T=D.T,k=D.k,cur=k>0?D.steps[k-1]:null;
const done=new Set();for(let j=0;j<k;j++)done.add(D.steps[j][0]+','+D.steps[j][1]);let ref=[];
if(cur){const[i,w]=cur,x=it[i-1];ref=[[i-1,w]];if(x.w<=w)ref.push([i-1,w-x.w])}
let h='<tr><th>Item \\ Capacity</th>'+Array.from({length:W+1},(_,w)=>`<th>${w}</th>`).join('')+'</tr>';
for(let i=0;i<=n;i++){h+=`<tr><th>${i===0?'0 (none)':esc(it[i-1].n)+` (${it[i-1].w}, ${it[i-1].v})`}</th>`;
for(let w=0;w<=W;w++){const show=i===0||w===0||done.has(i+','+w);let c=show?'':'emp';
if(cur&&cur[0]===i&&cur[1]===w)c='cur';else if(ref.some(r=>r[0]===i&&r[1]===w))c='ref';
if(k===D.steps.length&&k>0&&i===n&&w===W)c+=' fin';h+=`<td class="${c}">${T[i][w]}</td>`}h+='</tr>'}
$('#dpT').innerHTML=h;$('#dpSl').value=k;$('#dpSt').textContent=`Step ${k} of ${D.steps.length}`;
let e='Press Forward or Play. Row 0 and column 0 are already zero, since no items or no capacity means no value.';
if(cur){const[i,w]=cur,x=it[i-1],a=T[i-1][w];
if(x.w>w)e=`dp[${i}][${w}]: ${x.name||x.n} weighs ${x.w}, which is more than ${w}. It cannot fit, so copy the cell above: ${a}.`;
else{const b=x.v+T[i-1][w-x.w];e=`dp[${i}][${w}]: skip ${x.n} gives ${a}. Take it gives ${x.v} + dp[${i-1}][${w-x.w}] = ${x.v} + ${T[i-1][w-x.w]} = ${b}. The larger is ${Math.max(a,b)}, so we ${b>a?'take it':'skip it'}.`}}
if(k===D.steps.length&&k>0)e+` `,e+=` Finished: the answer is dp[${n}][${W}] = ${T[n][W]}.`;
$('#dpEx').textContent=e}
function dpGoto(k){D.k=Math.max(0,Math.min(D.steps.length,k));dpDraw()}
$('#dpNext').onclick=()=>dpGoto(D.k+1);$('#dpPrev').onclick=()=>dpGoto(D.k-1);$('#dpSl').oninput=e=>dpGoto(+e.target.value);
function play(){clearInterval(D.timer);D.timer=setInterval(()=>{if(D.k>=D.steps.length){clearInterval(D.timer);D.timer=null;$('#dpPlay').textContent='Play animation';return}dpGoto(D.k+1)},+$('#dpSpd').value)}
$('#dpPlay').onclick=()=>{if(D.timer){clearInterval(D.timer);D.timer=null;$('#dpPlay').textContent='Play animation';return}if(D.k>=D.steps.length)D.k=0;$('#dpPlay').textContent='Pause';play()};
$('#dpSpd').onchange=()=>{if(D.timer)play()};

/* ---------- algorithm race ---------- */
function race(){const it=S.items,W=S.cap;if(!it.length)return;const b=brute(it,W),g=greedy(it,W),r=dpSolve(it,W),cells=it.length*(W+1);
const mx=Math.max(b.c,cells,it.length);const L=(n,w,v,t,c)=>`<div class="cmp l" style="margin:.4rem 0"><span>${n}</span><div class="bar"><i style="width:${Math.max(3,w/mx*100)}%;background:${c}"></i></div><span>${t}</span></div>`;
$('#race').innerHTML=`<p class="why">${it.length} items, capacity ${W}. Best values found: brute force ${b.best}, greedy ${g.v}, DP ${r.best}.</p>`+L('Brute force',b.c,0,b.c+' subsets','var(--bad)')+L('Greedy',it.length,0,it.length+' items','var(--ok)')+L('Dynamic prog.',cells,0,cells+' cells','var(--acc)')}
const _rows=rows;rows=function(){_rows();race()};

/* ---------- applications ---------- */
(()=>{const A=[['Finance','🪙','var(--org)','Portfolio selection, budget planning, and investment decisions.','An investor has 10 lakh rupees and five funds with different costs and expected returns. Each fund is bought whole, so choosing the mix with the highest expected return under the budget is a 0/1 knapsack.'],
['Logistics','🚚','var(--blue)','Shipping, transportation, and cargo loading.','A truck carries 2000 kg. Parcels differ in weight and delivery fee. Loading the combination that earns the most without overloading is the knapsack.'],
['Computing','💾','var(--green)','Memory allocation, processor scheduling, and resource management.','A cache holds 64 MB. Each dataset has a size and a speed-up it gives. Choosing what to keep cached to save the most time is the same problem.'],
['Business','💼','var(--lil)','Project selection, resource distribution, and planning.','A team has 40 person-days. Each project needs some days and promises some profit. Picking the set of projects with the best profit is a knapsack.'],
['Everyday Life','🎒','var(--pink)','Packing bags, travel planning, and task prioritization.','You have 6 free hours on Sunday. Each task takes time and has an importance score. Choosing the tasks to maximize importance fits the same pattern.']];
$('#apps').innerHTML=A.map(a=>`<button class="ap" aria-expanded="false"><div class="ic" style="background:${a[2]}">${a[1]}</div><h3>${a[0]}</h3><p>${a[3]}</p><b style="color:var(--acc)">See example</b><div class="ex">${a[4]}</div></button>`).join('');
$('#apps').onclick=e=>{const b=e.target.closest('.ap');if(b){b.classList.toggle('open');b.setAttribute('aria-expanded',b.classList.contains('open'))}}})();

/* ---------- challenge ---------- */
(()=>{const I=[['Laptop','💻',4,9],['Camera','📷',3,8],['Books','📚',5,6],['Headphones','🎧',1,5],['Water bottle','🥤',2,3],['Clothes','👕',4,7],['Snacks','🍫',1,2],['Power bank','🔋',2,6]],C=10;let sel=new Set(),done=false;
const its=I.map(x=>({n:x[0],w:x[2],v:x[3]})),opt=dpSolve(its,C);
function draw(){$('#cItems').innerHTML=I.map((x,i)=>`<button class="it ${sel.has(i)?'sel':''}" data-i="${i}">${x[1]} ${x[0]}<small>${x[2]} kg, value ${x[3]}</small></button>`).join('');
let w=0,v=0;sel.forEach(i=>{w+=I[i][2];v+=I[i][3]});$('#cw').textContent=w;$('#cv').textContent=v;barRow($('#cbar'),w/C*100,w>C);$('#cwarn').textContent=w>C?'Too heavy. Remove something before submitting.':''}
$('#cItems').onclick=e=>{const b=e.target.closest('.it');if(!b||done)return;const i=+b.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);draw()};
$('#cGo').onclick=()=>{let w=0,v=0;sel.forEach(i=>{w+=I[i][2];v+=I[i][3]});if(w>C){$('#cwarn').classList.add('shake');setTimeout(()=>$('#cwarn').classList.remove('shake'),400);return}
done=true;const sc=Math.round(v/opt.best*100),best=Math.max(ls.get('ks_cbest',0),sc);ls.set('ks_cbest',best);
$('#cRes').innerHTML=`<div class="expl" style="margin-top:1rem"><b>Your score: ${sc}%</b> (value ${v} of a possible ${opt.best}). ${v===opt.best?'You found the optimal bag.':`You missed ${opt.best-v} points of value.`} Best so far on this device: ${best}%.<br>The optimal bag is ${opt.sel.map(i=>I[i][0]).join(', ')}, weighing ${opt.sel.reduce((a,i)=>a+I[i][2],0)} kg. Heavy low-value items like books use up room that the power bank and headphones fill far better per kilogram.</div>`};
$('#cRe').onclick=()=>{sel=new Set();done=false;$('#cRes').innerHTML='';draw()};draw()})();

/* ---------- quiz ---------- */
(()=>{const Q=[['What does the Knapsack Problem ask for?',['The lightest set of items','The highest total value without exceeding capacity','The cheapest item','Sorting items by name'],1,'We maximize value while keeping total weight within the limit.'],
['What is the main difference between 0/1 and Fractional Knapsack?',['Fractional items can be divided','0/1 allows duplicates','Fractional has no capacity','They are identical'],0,'In 0/1 an item is taken whole or not at all. In the fractional version you can take a part.'],
['In the DP approach, what does dp[i][w] mean?',['Weight of item i','Best value using the first i items with capacity w','Number of items in the bag','Ratio of item i'],1,'It is the maximum value achievable with the first i items and capacity w.'],
['Which recurrence is correct when item i fits?',['dp[i-1][w] + value[i]','max(dp[i-1][w], value[i] + dp[i-1][w-weight[i]])','min(dp[i-1][w], value[i])','dp[i][w-1]'],1,'Either skip the item, or take it and add its value to the best result with the remaining capacity.'],
['What is the time complexity of standard 0/1 knapsack DP?',['O(n log n)','O(2^n)','O(nW)','O(n)'],2,'The table has n rows and W columns, and each cell takes constant time.'],
['Memory allocation and cargo loading are examples of what?',['Sorting problems','Knapsack style resource allocation','Graph colouring','String matching'],1,'Both choose items under a fixed capacity to maximize benefit.']];
let q=0,sc=0,ans=false;
function draw(){if(q>=Q.length){const p=sc/Q.length,m=p===1?'Perfect. You clearly understand the knapsack.':p>=.67?'Solid work. A quick look at the DP table will fix the rest.':'Worth another pass through the Learn and DP sections.';
const b=Math.max(ls.get('ks_qbest',0),sc);ls.set('ks_qbest',b);$('#qz').innerHTML=`<h3>You scored ${sc} out of ${Q.length}</h3><p>${m} Best score on this device: ${b}.</p><button id="qr">Retry quiz</button>`;$('#qr').onclick=()=>{q=0;sc=0;draw()};return}
const x=Q[q];ans=false;$('#qz').innerHTML=`<div class="bar"><i style="width:${q/Q.length*100}%"></i></div><p class="why">Question ${q+1} of ${Q.length}</p><h3>${x[0]}</h3><div class="opts">${x[1].map((o,i)=>`<button data-i="${i}">${o}</button>`).join('')}</div><div id="fb"></div>`;
$('.opts').onclick=e=>{const b=e.target.closest('button');if(!b||ans)return;ans=true;const i=+b.dataset.i;if(i===x[2])sc++;
$$('.opts button').forEach((bt,j)=>{if(j===x[2])bt.classList.add('ok');else if(j===i)bt.classList.add('no')});
$('#fb').innerHTML=`<div class="expl"><b>${i===x[2]?'Correct.':'Not quite.'}</b> ${x[3]}</div><button id="qn">${q===Q.length-1?'See my score':'Next question'}</button>`;$('#qn').onclick=()=>{q++;draw()}}}
draw()})();

/* ---------- page chrome ---------- */
$('#theme').onclick=()=>{const d=document.documentElement.dataset.theme==='dark'||(!document.documentElement.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);const t=d?'light':'dark';document.documentElement.dataset.theme=t;$('#theme').textContent=t==='dark'?'Light':'Dark';ls.set('ks_theme',t)};
const th=ls.get('ks_theme',null);if(th){document.documentElement.dataset.theme=th;$('#theme').textContent=th==='dark'?'Light':'Dark'}
$('#menu').onclick=()=>$('#links').classList.toggle('open');$('#links').onclick=()=>$('#links').classList.remove('open');
$('#top').onclick=()=>scrollTo({top:0,behavior:'smooth'});
addEventListener('scroll',()=>{const h=document.documentElement;$('#sp').style.width=(scrollY/(h.scrollHeight-innerHeight)*100)+'%';$('#top').classList.toggle('show',scrollY>600)},{passive:true});
const seen=new Set(ls.get('ks_seen',[])),ids=['home','learn','types','simulator','algorithms','applications','challenge','quiz','references'];
const upd=()=>$('#prog').textContent=`Journey ${seen.size}/${ids.length}`;upd();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');const id=e.target.id;if(ids.includes(id)){seen.add(id);ls.set('ks_seen',[...seen]);upd()}
$$('.links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id))}}),{threshold:.15});
$$('section,footer').forEach(s=>{io.observe(s)});
rows();
