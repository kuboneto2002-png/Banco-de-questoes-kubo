const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const today = () => new Date().toISOString().slice(0,10);
const store = {
  read(){try{return JSON.parse(localStorage.getItem("rt-data"))||{tasks:[],sessions:[],questions:[],topics:[],timer:null}}catch{return {tasks:[],sessions:[],questions:[],topics:[],timer:null}}},
  write(){localStorage.setItem("rt-data",JSON.stringify(data))}
};
let data=store.read();
let timerTick=null;
const fmt = ms => {let sec=Math.max(0,Math.floor(ms/1000));let h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`};
const duration = ms => {let min=Math.floor(ms/60000);return `${Math.floor(min/60)}h ${String(min%60).padStart(2,"0")}min`};
const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(msg){let t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function showView(name){$$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));$$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("#page-title").textContent=({inicio:"Visão geral",planner:"Planner",cronometro:"Cronômetro",desempenho:"Desempenho",assuntos:"Assuntos",questoes:"Banco de questões"})[name];render()}
$$(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
function elapsed(){if(!data.timer)return 0;return data.timer.elapsed+(data.timer.running?Date.now()-data.timer.startedAt:0)}
function updateTimer(){let ms=elapsed();$("#timer-display").textContent=fmt(ms);let running=!!data.timer?.running;$("#timer-state").textContent=running?"Sessão em andamento":data.timer?"Sessão pausada":"Pronto para começar";$("#timer-start").disabled=running;$("#timer-pause").disabled=!running;$("#timer-finish").disabled=!data.timer}
function startTimer(){if(!$("#session-topic").value.trim()){toast("Informe o assunto da sessão.");return}if(!data.timer)data.timer={elapsed:0,running:false,startedAt:null,area:$("#session-area").value,topic:$("#session-topic").value.trim(),kind:$("#session-kind").value};if(!data.timer.running){data.timer.running=true;data.timer.startedAt=Date.now();store.write();updateTimer();timerTick=setInterval(updateTimer,500)}}
function pauseTimer(){if(!data.timer?.running)return;data.timer.elapsed=elapsed();data.timer.running=false;data.timer.startedAt=null;store.write();clearInterval(timerTick);updateTimer()}
function finishTimer(){if(!data.timer)return;let ms=elapsed();if(data.timer.running)clearInterval(timerTick);if(ms>=1000)data.sessions.unshift({id:crypto.randomUUID(),date:today(),duration:ms,area:data.timer.area,topic:data.timer.topic,kind:data.timer.kind});data.timer=null;store.write();updateTimer();render();toast("Sessão registrada com sucesso.")}
$("#timer-start").addEventListener("click",startTimer);$("#timer-pause").addEventListener("click",pauseTimer);$("#timer-finish").addEventListener("click",finishTimer);
if(data.timer?.running){data.timer.running=false;data.timer.startedAt=null;store.write();toast("Sessão anterior pausada. Retome quando quiser.")}
updateTimer();if(data.timerTick)clearInterval(data.timerTick);

function render(){
 const todayMs=data.sessions.filter(s=>s.date===today()).reduce((a,s)=>a+s.duration,0);
 const totalMs=data.sessions.reduce((a,s)=>a+s.duration,0);
 const qTotal=data.questions.reduce((a,q)=>a+q.total,0),qCorrect=data.questions.reduce((a,q)=>a+q.correct,0);
 const due=data.topics.filter(t=>t.reviewDate&&t.reviewDate<=today()).length;
 $("#today-hours").textContent=duration(todayMs);$("#total-hours").textContent=duration(totalMs);$("#total-questions").textContent=qTotal;
 $("#accuracy-label").textContent=qTotal?`${Math.round(qCorrect/qTotal*100)}% de acertos`:"Registre questões para acompanhar";
 $("#pending-reviews").textContent=due;$("#today-progress").style.width=Math.min(100,todayMs/14400000*100)+"%";
 renderTasks($("#today-plan"),data.tasks.filter(t=>t.date===today()));
 let areas=["Clínica Médica","Cirurgia","Pediatria","Ginecologia e Obstetrícia","Preventiva"];
 let vals=areas.map(a=>data.sessions.filter(s=>s.area===a).reduce((n,s)=>n+s.duration,0));
 let max=Math.max(...vals,1);
 $("#area-chart").innerHTML=vals.some(Boolean)?areas.map((a,i)=>`<div class="bar-row"><span>${a}</span><div class="bar"><i style="width:${vals[i]/max*100}%"></i></div><b>${(vals[i]/3600000).toFixed(1)}h</b></div>`).join(""):'<p class="empty">Seus dados aparecerão aqui conforme você estudar.</p>';
 let reviews=data.topics.filter(t=>t.reviewDate).sort((a,b)=>a.reviewDate.localeCompare(b.reviewDate)).slice(0,5);
 $("#review-list").innerHTML=reviews.length?reviews.map(t=>`<div class="task"><div class="task-main"><strong>${escapeHtml(t.topic)}</strong><small>${escapeHtml(t.area)} · ${new Date(t.reviewDate+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><span class="tag">${t.reviewDate<=today()?"Pendente":"Agendada"}</span></div>`).join(""):'<div class="empty">Nenhuma revisão cadastrada.</div>';
 let filter=$("#filter-date").value||today();renderTasks($("#planner-list"),data.tasks.filter(t=>t.date===filter),true);
 $("#session-history").innerHTML=data.sessions.length?data.sessions.slice(0,8).map(s=>`<div class="task"><div class="task-main"><strong>${escapeHtml(s.topic)}</strong><small>${escapeHtml(s.area)} · ${s.kind} · ${new Date(s.date+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><span class="tag">${duration(s.duration)}</span></div>`).join(""):'<div class="empty">Nenhuma sessão registrada.</div>';
 $("#perf-total").textContent=qTotal;$("#perf-correct").textContent=qCorrect;$("#perf-rate").textContent=qTotal?Math.round(qCorrect/qTotal*100)+"%":"—";
 let grouped={};data.questions.forEach(q=>{let k=q.topic;grouped[k]??={total:0,correct:0,area:q.area,inst:{}};grouped[k].total+=q.total;grouped[k].correct+=q.correct;grouped[k].inst[q.institution]=(grouped[k].inst[q.institution]||0)+q.total});
 let entries=Object.entries(grouped);
 $("#topic-performance").innerHTML=entries.length?entries.map(([topic,v])=>`<div class="task"><div class="task-main"><strong>${escapeHtml(topic)}</strong><small>${escapeHtml(v.area)} · ${Object.keys(v.inst).join(", ")}</small></div><span class="tag">${Math.round(v.correct/v.total*100)}% · ${v.correct}/${v.total}</span></div>`).join(""):'<div class="empty">Registre questões para visualizar seu desempenho.</div>';
 $("#topic-list").innerHTML=data.topics.length?data.topics.map(t=>`<div class="topic-row"><div class="task-main"><strong>${escapeHtml(t.topic)}</strong><small>${escapeHtml(t.area)} · ${escapeHtml(t.institution)} · Revisão: ${t.reviewDate?new Date(t.reviewDate+"T12:00:00").toLocaleDateString("pt-BR"):"não agendada"}</small></div><span class="tag priority-${t.priority.toLowerCase()}">${t.priority}</span><button class="text-button" data-review="${t.id}">Agendar D+1/7/30</button></div>`).join(""):'<div class="empty">Nenhum assunto cadastrado.</div>';
 $$("[data-review]").forEach(b=>b.addEventListener("click",()=>{let t=data.topics.find(x=>x.id===b.dataset.review);let d=new Date();d.setDate(d.getDate()+1);t.reviewDate=d.toISOString().slice(0,10);store.write();render();toast("Primeira revisão agendada para amanhã.")}));
}
function renderTasks(el,tasks,actions=false){el.classList.toggle("empty",!tasks.length);if(!tasks.length){el.textContent="Nenhuma tarefa planejada para esta data.";return}el.innerHTML=tasks.map(t=>`<div class="task ${t.done?"done":""}"><input class="task-check" type="checkbox" data-task="${t.id}" ${t.done?"checked":""}><div class="task-main"><strong>${escapeHtml(t.topic)}</strong><small>${escapeHtml(t.area)} · ${t.kind} · ${t.minutes} min</small></div><span class="tag">${t.kind}</span>${actions?`<div class="task-actions"><button data-delete="${t.id}" title="Excluir">✕</button></div>`:""}</div>`).join("");$$("[data-task]").forEach(c=>c.addEventListener("change",()=>{let t=data.tasks.find(x=>x.id===c.dataset.task);t.done=c.checked;store.write();render()}));$$("[data-delete]").forEach(b=>b.addEventListener("click",()=>{data.tasks=data.tasks.filter(t=>t.id!==b.dataset.delete);store.write();render()}))}
$("#filter-date").value=today();$("#filter-date").addEventListener("change",render);
function togglePanel(id){let p=$(id);p.hidden=!p.hidden}
$("#add-task-open").onclick=()=>togglePanel("#task-form-panel");$("#task-cancel").onclick=()=>togglePanel("#task-form-panel");
$("#task-form").addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target);data.tasks.push({id:crypto.randomUUID(),topic:f.get("topic"),area:f.get("area"),kind:f.get("kind"),date:f.get("date"),minutes:Number(f.get("minutes")),done:false});store.write();e.target.reset();e.target.elements.date.value=today();$("#task-form-panel").hidden=true;render();toast("Tarefa adicionada.")});
$("#task-form").elements.date.value=today();
$("#add-questions-open").onclick=()=>togglePanel("#question-form-panel");$("#question-cancel").onclick=()=>togglePanel("#question-form-panel");
$("#question-form").addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target),total=Number(f.get("total")),correct=Number(f.get("correct"));if(correct>total){toast("Acertos não podem superar o total de questões.");return}data.questions.push({id:crypto.randomUUID(),institution:f.get("institution"),area:f.get("area"),topic:f.get("topic"),total,correct,date:today()});store.write();e.target.reset();$("#question-form-panel").hidden=true;render();toast("Desempenho registrado.")});
$("#add-topic-open").onclick=()=>togglePanel("#topic-form-panel");$("#topic-cancel").onclick=()=>togglePanel("#topic-form-panel");
$("#topic-form").addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target);data.topics.push({id:crypto.randomUUID(),topic:f.get("topic"),area:f.get("area"),priority:f.get("priority"),institution:f.get("institution"),reviewDate:null});store.write();e.target.reset();$("#topic-form-panel").hidden=true;render();toast("Assunto cadastrado.")});
render();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
