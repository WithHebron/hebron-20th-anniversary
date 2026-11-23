(()=>{
const $=id=>document.getElementById(id), KEY="hebronQuest20Hybrid_v1";
let state={chapter:0,xp:0,done:[],badges:[],unlocked:1,choices:[]},line=0,mode="home";
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved)state={...state,...saved}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}};
const level=()=>1+Math.floor(state.xp/120);
const title=()=>state.xp>=400?"생명의 동행자":state.xp>=200?"돌봄의 실천가":state.xp>=80?"희망의 발견자":"새로운 여정";
function stats(){
 ["topXP","homeXP","gameXP"].forEach(id=>$(id).textContent=state.xp);
 ["topBadges","homeBadgeCount","gameBadges"].forEach(id=>$(id).textContent=state.badges.length);
 ["homeLevel","gameLevel"].forEach(id=>$(id).textContent=level());
 $("homeMissions").textContent=state.done.length;$("homeLevelName").textContent=title();
 $("homeProgressText").textContent=`${state.done.length} / 5 챕터`;
 $("homeProgress").style.width=(state.done.length/5*100)+"%";
 $("badgeList").innerHTML=state.badges.length?state.badges.map(b=>`<span class="earned-badge">🏅 ${b}</span>`).join(""):"아직 배지가 없어요.";
}
function chapterCards(){
 $("homeChapters").innerHTML=STORY.map((s,i)=>`<button class="chapter-tile ${i>=state.unlocked?"locked":""}" data-home-ch="${i}" ${i>=state.unlocked?"disabled":""}><span class="tile-num">CHAPTER ${String(i+1).padStart(2,"0")}</span><span class="tile-icon">${["🌾","🛣️","🏥","🩺","🌱"][i]}</span><b>${s.title}</b><span class="tile-status">${state.done.includes(i)?"✓ 완료":i<state.unlocked?"플레이 가능":"🔒 잠김"}</span></button>`).join("");
 document.querySelectorAll("[data-home-ch]").forEach(b=>b.onclick=()=>openGame(+b.dataset.homeCh));
}
function sideNav(){
 $("sideChapters").innerHTML=STORY.map((s,i)=>`<div class="side-chapter ${i===state.chapter?"active":""} ${i>=state.unlocked?"locked":""}" data-side="${i}"><span class="side-number">${state.done.includes(i)?"✓":String(i+1).padStart(2,"0")}</span><span>${s.title}</span></div>`).join("");
 document.querySelectorAll("[data-side]").forEach(b=>b.onclick=()=>{const n=+b.dataset.side;if(n<state.unlocked){state.chapter=n;renderChapter()}});
}
function openGame(n=0){if(n>=state.unlocked)return;mode="game";$("homeView").classList.add("hidden");$("gameView").classList.remove("hidden");state.chapter=n;renderChapter();window.scrollTo(0,0)}
function openHome(){mode="home";$("gameView").classList.add("hidden");$("homeView").classList.remove("hidden");stats();chapterCards();window.scrollTo(0,0)}
function renderChapter(){
 const s=STORY[state.chapter];line=0;
 $("chapterCode").textContent=`CHAPTER ${String(state.chapter+1).padStart(2,"0")} · ${s.code}`;
 $("chapterTitle").textContent=s.title;$("placeName").textContent=s.place;$("sceneImage").src=s.image;
 $("sceneLocation").textContent=s.location;$("speaker").textContent=s.speaker;$("dialogueSpeaker").textContent=s.speaker;
 $("characterChip").querySelector(".avatar").textContent=s.avatar;
 $("missionTitle").textContent=s.mission;$("missionXP").textContent="+"+Math.max(...s.choices.map(c=>c[3]))+" XP";
 $("dialogueText").textContent=s.lines[0];$("lineNo").textContent=`01 / 0${s.lines.length}`;
 $("dialogueCard").classList.remove("hidden");$("choiceCard").classList.add("hidden");$("endingCard").classList.add("hidden");
 $("continueBtn").textContent="이야기 계속 듣기 →";
 $("chapterProgressLabel").textContent=`챕터 ${state.chapter+1} / 5`;
 $("chapterProgress").style.width=((state.chapter+1)/5*100)+"%";$("chapterPercent").textContent=Math.round((state.chapter+1)/5*100)+"%";
 sideNav();stats();save();if(AudioFX.voiceOn)AudioFX.speak(s.lines[0]);
}
function advance(){if(mode!=="game"||!$("completeModal").classList.contains("hidden"))return;const s=STORY[state.chapter];line++;if(line<s.lines.length){$("dialogueText").textContent=s.lines[line];$("lineNo").textContent=`${String(line+1).padStart(2,"0")} / 0${s.lines.length}`;AudioFX.fx("step");AudioFX.speak(s.lines[line])}else showChoices()}
function showChoices(){const s=STORY[state.chapter];$("dialogueCard").classList.add("hidden");$("choiceCard").classList.remove("hidden");$("choiceQuestion").textContent=state.chapter===4?"마지막으로 어떤 돌봄을 이어갈까요?":"어떤 행동을 선택할까요?";$("choiceOptions").innerHTML=s.choices.map((c,i)=>`<button class="choice-option" data-pick="${i}"><b>${c[0]}</b><small>${c[1]}</small></button>`).join("");document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>choose(+b.dataset.pick));AudioFX.fx("choice")}
function choose(i){const s=STORY[state.chapter],c=s.choices[i];state.choices[state.chapter]=i;state.xp+=c[3];if(!state.done.includes(state.chapter))state.done.push(state.chapter);state.unlocked=Math.max(state.unlocked,Math.min(5,state.chapter+2));if(c[4]&&!state.badges.includes(c[4]))state.badges.push(c[4]);save();stats();$("choiceCard").classList.add("hidden");$("modalIcon").textContent=state.chapter===4?"🏆":"✦";$("modalTitle").textContent=state.chapter===4?"다섯 개의 장을 완주했습니다!":"미션 완료!";$("modalText").textContent=c[2];$("modalReward").textContent=`+${c[3]} XP${c[4]?" · 🏅 "+c[4]+" 배지 획득":""}`;$("modalNext").textContent=state.chapter===4?"여정의 의미 보기 →":"다음 챕터로 →";$("completeModal").classList.remove("hidden");AudioFX.fx("success");AudioFX.speak(c[2]);sideNav();chapterCards()}
function modalNext(){ $("completeModal").classList.add("hidden");if(state.chapter===4){const paths=state.choices.map((v,i)=>v===undefined?"":STORY[i].choices[v][0]).filter(Boolean);$("endingCard").textContent="🌿 생명을 향한 여정은 계속됩니다.\n\n캄보디아의 한 마을에서 시작된 이야기는 헤브론의료원에서 이어졌습니다. 병원에 도착하는 것, 치료받는 것, 회복을 이어가는 것. 그 모든 순간에 함께하는 마음이 필요합니다.\n\n나의 선택: "+paths.join("  ·  ")+"\n\nHEBRON MEDICAL CENTER · 20 YEARS";$("endingCard").classList.remove("hidden");$("characterChip").classList.add("hidden");return}openGame(state.chapter+1)}
function openAudio(){$("audioModal").classList.remove("hidden")}
function closeAudio(){$("audioModal").classList.add("hidden")}
$("startGame").onclick=()=>openGame(Math.min(state.unlocked-1,state.chapter||0));
$("backHome").onclick=openHome;$("continueBtn").onclick=advance;$("nextLine").onclick=advance;$("prevLine").onclick=()=>{if(line>0){line--;const s=STORY[state.chapter];$("dialogueText").textContent=s.lines[line];$("lineNo").textContent=`${String(line+1).padStart(2,"0")} / 0${s.lines.length}`;AudioFX.speak(s.lines[line])}};
$("modalNext").onclick=modalNext;$("soundOpen").onclick=openAudio;$("soundOpen2").onclick=openAudio;$("closeAudio").onclick=closeAudio;
$("ambienceToggle").onchange=e=>AudioFX.setAmbience(e.target.checked);
$("fxToggle").onchange=e=>AudioFX.fxOn=e.target.checked;
$("voiceToggle").onchange=e=>AudioFX.setVoice(e.target.checked);
$("voiceLang").onchange=e=>AudioFX.setLang(e.target.value);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeAudio();$("completeModal").classList.add("hidden")}if((e.code==="Space"||e.key==="Enter")&&mode==="game"&&$("completeModal").classList.contains("hidden")&&$("audioModal").classList.contains("hidden")){if(!$("choiceCard").classList.contains("hidden"))return;e.preventDefault();advance()}});
stats();chapterCards();openHome();
})();