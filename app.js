let currentFilter = "All";
let currentSearch = "";
let selectedFeedback = "";

document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initTyping();
  initCounters();
  initReveal();
  initNavigation();
  initTheme();
  initLanguages();
  initTroubleshooting();
  initTools();
  initFeedback();
  initComments();
  updateTimestamp();
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();
});

function initParticles(){
  const box=document.getElementById("particles"); if(!box)return;
  for(let i=0;i<35;i++){
    const p=document.createElement("span");
    p.className="particle";
    p.style.left=Math.random()*100+"%";
    p.style.animationDuration=(8+Math.random()*15)+"s";
    p.style.animationDelay=Math.random()*10+"s";
    p.style.opacity=.15+Math.random()*.5;
    box.appendChild(p);
  }
}

function initTyping(){
  const el=document.getElementById("typingText"); if(!el)return;
  const words=["Active Directory","MikroTik RouterOS","Network Troubleshooting","Windows Administration","CCTV Systems","IT Infrastructure"];
  let wi=0,ci=0,del=false;
  function tick(){
    const word=words[wi];
    if(!del){el.textContent=word.slice(0,++ci); if(ci>=word.length){del=true;setTimeout(tick,1200);return}}
    else{el.textContent=word.slice(0,--ci);if(ci<=0){del=false;wi=(wi+1)%words.length}}
    setTimeout(tick,del?35:65);
  }
  tick();
}

function initCounters(){
  const items=document.querySelectorAll(".stat-number");
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target,target=Number(el.dataset.count||0),start=performance.now(),dur=900;
      function frame(now){
        const p=Math.min((now-start)/dur,1);
        el.textContent=Math.floor(target*p)+"+";
        if(p<1)requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);obs.unobserve(el);
    });
  },{threshold:.4});
  items.forEach(x=>obs.observe(x));
}

function initReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("show");obs.unobserve(e.target)}});
  },{threshold:.1});
  document.querySelectorAll(".reveal,.reveal-right").forEach(x=>obs.observe(x));
}

function initNavigation(){
  const menu=document.getElementById("menuToggle"),nav=document.getElementById("navLinks");
  if(menu&&nav)menu.addEventListener("click",()=>nav.classList.toggle("open"));
  document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>nav?.classList.remove("open")));
  const sections=[...document.querySelectorAll("main section[id]")],links=[...document.querySelectorAll(".nav-link")];
  window.addEventListener("scroll",()=>{
    let current="home";
    sections.forEach(s=>{if(scrollY>=s.offsetTop-150)current=s.id});
    links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+current));
  });
}

function initTheme(){
  const btn=document.getElementById("themeToggle"),saved=localStorage.getItem("softorbit-theme");
  if(saved==="light"){document.body.classList.add("light");if(btn)btn.textContent="☀"}
  btn?.addEventListener("click",()=>{
    document.body.classList.toggle("light");
    const light=document.body.classList.contains("light");
    localStorage.setItem("softorbit-theme",light?"light":"dark");
    btn.textContent=light?"☀":"☾";
  });
}

function initLanguages(){
  const select=document.getElementById("languageSelect"); if(!select)return;
  languages.forEach(([code,name])=>{
    if(select.querySelector(`option[value="${CSS.escape(code)}"]`))return;
    const o=document.createElement("option");o.value=code;o.textContent=name;select.appendChild(o);
  });
  const saved=localStorage.getItem("softorbit-language")||"en";
  select.value=saved;
  select.addEventListener("change",()=>{
    localStorage.setItem("softorbit-language",select.value);
    if(select.value==="en"){restoreEnglish();return}
    requestTranslation(select.value);
  });
}

/* For a static/local build we keep the language selector ready for 100 languages.
   Google Translate is loaded only when a non-English language is selected. */
function requestTranslation(code){
  const combo=document.querySelector(".goog-te-combo");
  if(combo){combo.value=code;combo.dispatchEvent(new Event("change"));return;}
  loadGoogleTranslate(()=>requestTranslation(code));
}
function loadGoogleTranslate(done){
  if(window.google?.translate){done();return}
  window.googleTranslateElementInit=function(){
    new google.translate.TranslateElement({pageLanguage:"en",autoDisplay:false}, "google_translate_element");
    setTimeout(done,500);
  };
  const s=document.createElement("script");
  s.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async=true;document.body.appendChild(s);
}
function restoreEnglish(){
  const combo=document.querySelector(".goog-te-combo");
  if(combo){combo.value="en";combo.dispatchEvent(new Event("change"));}
}

function initTroubleshooting(){
  const search=document.getElementById("searchInput"),clear=document.getElementById("clearSearch");
  buildFilters();renderIssues();
  search?.addEventListener("input",e=>{currentSearch=e.target.value.toLowerCase().trim();renderIssues()});
  clear?.addEventListener("click",()=>{search.value="";currentSearch="";renderIssues();search.focus()});
}

function buildFilters(){
  const bar=document.getElementById("filterBar");if(!bar)return;
  const cats=["All",...new Set(troubleshootingData.map(x=>x.category))];
  bar.innerHTML=cats.map(c=>`<button class="filter-btn ${c==="All"?"active":""}" data-filter="${escapeAttr(c)}">${escapeHTML(c)}</button>`).join("");
  bar.querySelectorAll(".filter-btn").forEach(btn=>btn.addEventListener("click",()=>{
    bar.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
    currentFilter=btn.dataset.filter;renderIssues();
  }));
}

function renderIssues(){
  const box=document.getElementById("troubleshootingResults"),empty=document.getElementById("noResults"),info=document.getElementById("resultsInfo");
  if(!box)return;
  const q=currentSearch;
  const terms=q.split(/\s+/).filter(Boolean);
  const results=troubleshootingData.filter(issue=>{
    const cat=currentFilter==="All"||issue.category===currentFilter;
    if(!cat)return false;if(!terms.length)return true;
    const text=[issue.title,issue.category,issue.summary,...issue.keywords,...issue.causes,...issue.symptoms,...issue.diagnosis,...issue.solution].join(" ").toLowerCase();
    return terms.every(t=>text.includes(t));
  });
  box.innerHTML=results.map((issue,i)=>`
    <article class="issue-card" style="animation-delay:${i*35}ms">
      <div class="issue-top"><span class="issue-category">${escapeHTML(issue.category)}</span><span class="difficulty">${escapeHTML(issue.difficulty)}</span></div>
      <h3>${escapeHTML(issue.title)}</h3>
      <p>${escapeHTML(issue.summary)}</p>
      <button class="view-solution" data-id="${issue.id}">View Solution →</button>
    </article>`).join("");
  info.textContent=`${results.length} solution${results.length===1?"":"s"} found`;
  empty.classList.toggle("hidden",results.length!==0);
  box.querySelectorAll(".view-solution").forEach(b=>b.addEventListener("click",()=>openSolution(Number(b.dataset.id))));
}

function openSolution(id){
  const issue=troubleshootingData.find(x=>x.id===id);if(!issue)return;
  const modal=document.getElementById("solutionModal"),content=document.getElementById("modalContent");
  content.innerHTML=`
    <div class="solution-category">${escapeHTML(issue.category)} • ${escapeHTML(issue.difficulty)}</div>
    <h2 class="solution-title">${escapeHTML(issue.title)}</h2>
    ${sectionList("🔴 Symptoms",issue.symptoms)}
    ${sectionList("⚠️ Possible Causes",issue.causes)}
    ${sectionList("🔍 Diagnosis",issue.diagnosis)}
    ${sectionList("✅ Solution",issue.solution)}
    <div class="solution-section"><h4>💻 Useful Commands</h4>
      <div class="command-box"><button class="copy-command">📋 Copy</button><pre class="notranslate"><code>${escapeHTML(issue.commands)}</code></pre></div>
    </div>
    <div class="solution-section"><div class="warning-box">⚠️ Verify your actual interfaces, gateway addresses, RouterOS/Windows version and production change-control requirements before applying commands.</div></div>`;
  modal.classList.add("active");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  content.querySelector(".copy-command").addEventListener("click",()=>copyText(issue.commands));
}
function sectionList(title,items){
  return `<div class="solution-section"><h4>${title}</h4><ul>${items.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ul></div>`;
}
function closeModal(){
  const m=document.getElementById("solutionModal");m.classList.remove("active");m.setAttribute("aria-hidden","true");document.body.style.overflow="";
}
document.getElementById("modalClose")?.addEventListener("click",closeModal);
document.getElementById("solutionModal")?.addEventListener("click",e=>{if(e.target.id==="solutionModal")closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

async function copyText(text){
  try{await navigator.clipboard.writeText(text)}catch{
    const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove();
  }
  showToast("Copied to clipboard");
}
function showToast(text){const t=document.getElementById("toast");t.textContent=text;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),1500)}
document.addEventListener("click",e=>{const b=e.target.closest("[data-copy]");if(b)copyText(b.dataset.copy)});

function initTools(){
  document.getElementById("calcSubnet")?.addEventListener("click",calcSubnet);
  document.getElementById("generatePassword")?.addEventListener("click",generatePassword);
  document.getElementById("copyPassword")?.addEventListener("click",()=>copyText(document.getElementById("passwordOutput").value));
  document.getElementById("passwordLength")?.addEventListener("input",e=>document.getElementById("passwordLengthValue").textContent=e.target.value);
  document.getElementById("refreshTimestamp")?.addEventListener("click",updateTimestamp);
  document.getElementById("encode64")?.addEventListener("click",()=>base64(true));
  document.getElementById("decode64")?.addEventListener("click",()=>base64(false));
  generatePassword();
  calcSubnet();
}
function calcSubnet(){
  const ip=document.getElementById("ipInput").value.trim(),prefix=Number(document.getElementById("prefixInput").value),out=document.getElementById("subnetResult");
  if(!isValidIPv4(ip)||prefix<0||prefix>32){out.textContent="Enter a valid IPv4 address and prefix.";return}
  const n=ipToInt(ip),mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0,network=(n&mask)>>>0,broadcast=(network|(~mask))>>>0;
  const hosts=prefix>=31?(prefix===31?2:1):Math.max(0,broadcast-network-1);
  out.innerHTML=`Network: <b>${intToIp(network)}</b><br>Broadcast: <b>${intToIp(broadcast)}</b><br>Usable hosts: <b>${hosts}</b>`;
}
function isValidIPv4(ip){const p=ip.split(".");return p.length===4&&p.every(x=>/^\d+$/.test(x)&&+x>=0&&+x<=255)}
function ipToInt(ip){return ip.split(".").reduce((a,o)=>(a*256+Number(o))>>>0,0)}
function intToIp(n){return[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".")}
function generatePassword(){
  const len=Number(document.getElementById("passwordLength").value),chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let s="";for(let i=0;i<len;i++)s+=chars[Math.floor(Math.random()*chars.length)];
  document.getElementById("passwordOutput").value=s;
}
function updateTimestamp(){
  const el=document.getElementById("timestampTool");if(!el)return;
  const d=new Date();el.textContent=`${d.toISOString()}\nUnix: ${Math.floor(d.getTime()/1000)}`;
}
function base64(enc){
  const input=document.getElementById("base64Input").value,out=document.getElementById("base64Output");
  try{out.value=enc?btoa(unescape(encodeURIComponent(input))):decodeURIComponent(escape(atob(input)))}catch{out.value="Invalid Base64 input."}
}

function initFeedback(){
  document.querySelectorAll(".feedback-btn").forEach(b=>b.addEventListener("click",()=>{
    selectedFeedback=b.dataset.rating;
    document.querySelectorAll(".feedback-btn").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
  }));
  document.getElementById("submitFeedback")?.addEventListener("click",()=>{
    const text=document.getElementById("feedbackText").value.trim(),msg=document.getElementById("feedbackMessage");
    if(!selectedFeedback&&!text){msg.textContent="Please select a rating or write feedback.";return}
    const data=JSON.parse(localStorage.getItem("softorbit-feedback")||"[]");
    data.push({rating:selectedFeedback,text,date:new Date().toISOString()});localStorage.setItem("softorbit-feedback",JSON.stringify(data));
    document.getElementById("feedbackText").value="";msg.textContent="Thank you — feedback saved on this device.";
  });
}

function initComments(){
  renderComments();
  document.getElementById("submitComment")?.addEventListener("click",()=>{
    const name=document.getElementById("commentName").value.trim()||"Anonymous",text=document.getElementById("commentText").value.trim();
    if(!text)return;
    const comments=JSON.parse(localStorage.getItem("softorbit-comments")||"[]");
    comments.unshift({name,text,date:new Date().toLocaleString()});localStorage.setItem("softorbit-comments",JSON.stringify(comments.slice(0,50)));
    document.getElementById("commentName").value="";document.getElementById("commentText").value="";renderComments();
  });
}
function renderComments(){
  const box=document.getElementById("commentList");if(!box)return;
  const comments=JSON.parse(localStorage.getItem("softorbit-comments")||"[]");
  box.innerHTML=comments.length?comments.map(c=>`<div class="comment"><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.date)}</small><p>${escapeHTML(c.text)}</p></div>`).join(""):`<div class="comment"><p>No comments yet. Be the first.</p></div>`;
}

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHTML(s).replace(/`/g,"&#96;")}
/* =========================================================
   SOFTORBIT — CROWDSTRIKE FIREWALL MODULE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------------------------------------
     CrowdStrike Module Tabs
     ------------------------------------------------------- */

  const csTabs = document.querySelectorAll("[data-cs-tab]");
  const csPanels = document.querySelectorAll("[data-cs-panel]");

  csTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const target = tab.dataset.csTab;

      csTabs.forEach(item => {
        item.classList.remove("active");
      });

      csPanels.forEach(panel => {
        panel.classList.remove("active");
      });

      tab.classList.add("active");

      const targetPanel =
        document.querySelector(`[data-cs-panel="${target}"]`);

      if (targetPanel) {
        targetPanel.classList.add("active");
      }

    });

  });


  /* -------------------------------------------------------
     CrowdStrike Firewall Rule Builder
     ------------------------------------------------------- */

  const buildRuleButton =
    document.getElementById("buildCrowdStrikeRule");

  if (buildRuleButton) {

    buildRuleButton.addEventListener("click", () => {

      const direction =
        document.getElementById("csDirection").value;

      const protocol =
        document.getElementById("csProtocol").value;

      const destination =
        document.getElementById("csDestination").value.trim();

      const port =
        document.getElementById("csPort").value.trim();

      const action =
        document.getElementById("csAction").value;

      const result =
        document.getElementById("crowdStrikeRuleResult");

      if (!destination || !port) {

        result.innerHTML = `
          <div class="callout warning">
            ⚠️ Please enter the destination/source and port.
          </div>
        `;

        return;
      }


      const ruleSummary = `
Direction: ${direction}
Protocol: ${protocol}
Source/Destination: ${destination}
Port: ${port}
Action: ${action}
      `.trim();


      result.innerHTML = `
        <div class="callout">

          <strong>Generated Rule Summary</strong>

          <div class="code-box" style="margin-top:12px">

            <button
              class="copy-btn"
              data-copy="${escapeHtmlAttribute(ruleSummary)}">
              📋 Copy
            </button>

            <pre class="notranslate"><code>${escapeHtml(ruleSummary)}</code></pre>

          </div>

          <p style="margin-top:12px">
            This is a planning/learning representation.
            Verify the actual CrowdStrike tenant configuration,
            supported fields and policy scope before deployment.
          </p>

        </div>
      `;


      /* Attach copy event to newly generated button */

      const copyButton =
        result.querySelector(".copy-btn");

      if (copyButton) {

        copyButton.addEventListener("click", () => {

          const text =
            copyButton.dataset.copy;

          navigator.clipboard.writeText(text)
            .then(() => {

              showSoftOrbitToast("Rule summary copied!");

            })
            .catch(() => {

              showSoftOrbitToast("Copy failed");

            });

        });

      }

    });

  }


  /* -------------------------------------------------------
     Helper Functions
     ------------------------------------------------------- */

  function escapeHtml(value) {

    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function escapeHtmlAttribute(value) {

    return escapeHtml(value)
      .replace(/\n/g, "&#10;");

  }


  function showSoftOrbitToast(message) {

    const toast =
      document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

      toast.classList.remove("show");

    }, 1800);

  }

});
