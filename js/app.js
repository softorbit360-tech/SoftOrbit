const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
let currentCategory='All', searchText='';
function init(){renderFilters();renderNav();renderCards();initTyping();initParticles();initTheme();initFeedback();initComments();initTools();initLanguages();$('#year').textContent=new Date().getFullYear();}
function renderFilters(){ $('#filters').innerHTML=CATEGORIES.map(c=>`<button class="filter ${c===currentCategory?'active':''}" data-cat="${c}">${c}</button>`).join(''); $$('.filter').forEach(b=>b.onclick=()=>{currentCategory=b.dataset.cat;renderFilters();renderNav();renderCards();}); }
function match(t){const hay=[t.category,t.tag,t.title,t.summary,...t.keywords,...t.symptoms,...t.causes,...t.diagnosis,...t.solution,t.commands].join(' ').toLowerCase();return hay.includes(searchText.toLowerCase());}
function filtered(){return TOPICS.filter(t=>(currentCategory==='All'||t.category===currentCategory)&&match(t));}
function renderNav(){const list=TOPICS.filter(t=>currentCategory==='All'||t.category===currentCategory);$('#nav').innerHTML=list.map(t=>`<a href="#" onclick="openTopic('${t.id}');return false"><span>${t.icon}</span>${t.title}</a>`).join('');}
function renderCards(){const list=filtered();$('#resultsInfo').textContent=`${list.length} / ${TOPICS.length}`;$('#cards').innerHTML=list.map(t=>`<article class="card reveal"><div class="card-top"><span class="icon">${t.icon}</span><span class="tag">${t.category}</span></div><h3>${t.title}</h3><p>${t.summary}</p><div class="mini">${t.keywords.slice(0,4).map(k=>`<b>${k}</b>`).join('')}</div><div class="difficulty ${t.difficulty.toLowerCase()}">${t.difficulty}</div><button onclick="openTopic('${t.id}')">Open troubleshooting →</button></article>`).join('');$('#count').textContent=TOPICS.length;}
window.openTopic=id=>{const t=TOPICS.find(x=>x.id===id);$('#detail').innerHTML=`<div class="detail-head"><span class="icon">${t.icon}</span><div><span class="tag">${t.category} · ${t.difficulty}</span><h3>${t.title}</h3><p>${t.summary}</p></div></div><div class="playbook"><div><h4>Symptoms</h4><ul>${t.symptoms.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h4>Possible causes</h4><ul>${t.causes.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><h4>Diagnosis</h4><ol>${t.diagnosis.map(x=>`<li>${x}</li>`).join('')}</ol></div><div><h4>Solution / implementation</h4><ol>${t.solution.map(x=>`<li>${x}</li>`).join('')}</ol></div></div><div class="command-box"><div class="command-head"><h4>Commands / implementation notes</h4><button onclick="copyText(document.getElementById('commands').textContent,this)">Copy</button></div><pre id="commands">${escapeHTML(t.commands)}</pre></div>`;$('#lab').scrollIntoView({behavior:'smooth'});};
$('#search').addEventListener('input',e=>{searchText=e.target.value;renderNav();renderCards();});
function copyText(text,btn){navigator.clipboard?.writeText(text);if(btn){const old=btn.textContent;btn.textContent='Copied ✓';setTimeout(()=>btn.textContent=old,1200);}}
function initParticles(){const p=$('#particles');for(let i=0;i<42;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.animationDelay=Math.random()*8+'s';s.style.animationDuration=(7+Math.random()*12)+'s';p.appendChild(s);}}
function initTyping(){const e=$('#typingText'), words=['Active Directory','MikroTik RouterOS','CrowdStrike Falcon','Network Troubleshooting','Windows Administration','CCTV Systems'];let wi=0,ci=0,del=false;function tick(){const w=words[wi];e.textContent=w.slice(0,ci);if(!del){ci++;if(ci>w.length){del=true;return setTimeout(tick,1100)}}else{ci--;if(ci<0){ci=0;del=false;wi=(wi+1)%words.length}}setTimeout(tick,del?35:65)}tick();}
function initTheme(){const saved=localStorage.getItem('softorbit-theme');if(saved==='light')document.body.classList.add('light');$('#theme').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('softorbit-theme',document.body.classList.contains('light')?'light':'dark');$('#theme').textContent=document.body.classList.contains('light')?'☀':'☾';};}
function initLanguages(){const s=$('#language');LANGUAGES.forEach(l=>{const o=document.createElement('option');o.textContent=l;o.value=l;s.appendChild(o)});s.onchange=()=>{if(s.value!=='English')$('#feedbackMessage').textContent=`Language selected: ${s.value}. Full offline translation requires a translation dictionary; the module selector is ready for expansion.`;};}
function initTools(){ $('#calcIp').onclick=()=>{const [ip,prefix]=($('#ipInput').value||'').split('/');const p=Number(prefix);if(!ip||p<0||p>32)return $('#ipOut').textContent='Enter CIDR like 192.168.10.0/24';const nums=ip.split('.').map(Number);const mask=p===0?0:(0xffffffff<<(32-p))>>>0;const n=((nums[0]<<24|nums[1]<<16|nums[2]<<8|nums[3])>>>0)&mask;const b=(n|(~mask>>>0))>>>0;$('#ipOut').textContent=`Network: ${(n>>>24)&255}.${(n>>>16)&255}.${(n>>>8)&255}.${n&255}\nBroadcast: ${(b>>>24)&255}.${(b>>>16)&255}.${(b>>>8)&255}.${b&255}\nPrefix: /${p}`;};$('#genPw').onclick=()=>{let c='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';let a=new Uint32Array(Number($('#pwLen').value)||18);crypto.getRandomValues(a);let pw=[...a].map(x=>c[x%c.length]).join('');$('#pwOut').textContent=pw;copyText(pw);};function ts(){$('#timestamp').textContent=Math.floor(Date.now()/1000)}ts();setInterval(ts,1000);$('#refreshTimestamp').onclick=ts;}
function initFeedback(){$$('.feedback-btn').forEach(b=>b.onclick=()=>{localStorage.setItem('softorbit-feedback',b.dataset.feedback);$('#feedbackMessage').textContent=b.dataset.feedback==='helpful'?'Thanks — glad it helped! 👍':'Thanks — your feedback will help improve the knowledge base.';});}
function initComments(){renderComments();$('#commentForm').onsubmit=e=>{e.preventDefault();const name=$('#commentName').value.trim(),text=$('#commentText').value.trim();if(!name||!text)return;const arr=JSON.parse(localStorage.getItem('softorbit-comments')||'[]');arr.unshift({name,text,date:new Date().toLocaleString()});localStorage.setItem('softorbit-comments',JSON.stringify(arr.slice(0,30)));e.target.reset();renderComments();};}
function renderComments(){const arr=JSON.parse(localStorage.getItem('softorbit-comments')||'[]');$('#commentsList').innerHTML=arr.length?arr.slice(0,8).map(c=>`<div class="comment"><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.date)}</small><p>${escapeHTML(c.text)}</p></div>`).join(''):'<p class="muted">No comments yet.</p>';}
function escapeHTML(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
document.addEventListener('DOMContentLoaded',init);
// IPv4 Calculator functions
function updatePrefix() {
  const prefix = document.getElementById("prefixSlider").value;
  document.getElementById("prefixValue").innerText = "/" + prefix;
}

function updateMask() {
  const mask = document.getElementById("subnetMask").value;
  document.getElementById("maskBinary").innerText = maskToBinary(mask);
  document.getElementById("wildBinary").innerText = maskToWildcard(mask);
}

function calculateSubnet() {
  const ip = document.getElementById("ipAddress").value;
  const prefix = parseInt(document.getElementById("prefixSlider").value);
  const subnetMask = prefixToMask(prefix);

  document.getElementById("maskBinary").innerText = maskToBinary(subnetMask);
  document.getElementById("wildBinary").innerText = maskToWildcard(subnetMask);
  document.getElementById("hosts").innerText = Math.pow(2, 32 - prefix) - 2;

  const ipParts = ip.split(".").map(Number);
  const maskParts = subnetMask.split(".").map(Number);
  const networkParts = ipParts.map((p, i) => p & maskParts[i]);
  const broadcastParts = ipParts.map((p, i) => p | (~maskParts[i] & 255));

  document.getElementById("network").innerText = networkParts.join(".");
  document.getElementById("broadcast").innerText = broadcastParts.join(".");
  document.getElementById("firstHost").innerText = networkParts.slice(0,3).join(".") + "." + (networkParts[3] + 1);
  document.getElementById("lastHost").innerText = broadcastParts.slice(0,3).join(".") + "." + (broadcastParts[3] - 1);

  document.getElementById("ipBinary").innerText = ipParts.map(p => p.toString(2).padStart(8,"0")).join(".");
}

function prefixToMask(prefix) {
  let mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(8, prefix - i * 8);
    mask.push(bits > 0 ? 256 - Math.pow(2, 8 - bits) : 0);
  }
  return mask.join(".");
}

function maskToBinary(mask) {
  return mask.split(".").map(octet => parseInt(octet).toString(2).padStart(8, "0")).join(".");
}

function maskToWildcard(mask) {
  return mask.split(".").map(octet => (255 - parseInt(octet)).toString(2).padStart(8, "0")).join(".");
}

