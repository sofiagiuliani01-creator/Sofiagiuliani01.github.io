const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const scenes=[...document.querySelectorAll('[data-scene]')];
let sceneObserver,openingObserver;
function initMotion(){
 sceneObserver?.disconnect();openingObserver?.disconnect();
 document.body.classList.toggle('motion',!reduceMotion.matches);
 if(reduceMotion.matches){document.querySelector('.opening').classList.add('is-visible');scenes.forEach(el=>el.classList.add('is-playing'));return}
 openingObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');openingObserver.unobserve(entry.target)}})},{threshold:.35});
 openingObserver.observe(document.querySelector('.opening'));
 sceneObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-playing')}else if(entry.boundingClientRect.top>innerHeight*.3){entry.target.classList.remove('is-playing')}})},{threshold:.35});
 scenes.forEach(el=>sceneObserver.observe(el));
}
initMotion();reduceMotion.addEventListener('change',initMotion);
const cards=[...document.querySelectorAll('.feature-card')];let framePending=false;
function updateStack(){framePending=false;cards.forEach((card,index)=>{if(index===cards.length-1)return;const current=card.getBoundingClientRect(),next=cards[index+1].getBoundingClientRect();const cover=1-Math.max(0,Math.min(1,(next.top-current.top)/current.height));card.style.setProperty('--cover',reduceMotion.matches?'0':cover.toFixed(3))})}
function scheduleStack(){if(!framePending){framePending=true;requestAnimationFrame(updateStack)}}
window.addEventListener('scroll',scheduleStack,{passive:true});window.addEventListener('resize',scheduleStack);updateStack();
const content={nutrition:`<span class="app-kicker">Il tuo piano</span><strong class="app-title">Pranzo</strong><div class="app-rows"><div class="app-row"><svg><use href="#bowl"/></svg><div><span>Pasta integrale</span><strong>La tua porzione</strong></div></div><div class="app-row"><svg><use href="#can"/></svg><div><span>Ceci</span><strong>Le tue alternative</strong></div></div><div class="app-row"><svg><use href="#leaf"/></svg><div><span>Verdure di stagione</span><strong>Il gusto che preferisci</strong></div></div></div>`,training:`<span class="app-kicker">La tua scheda</span><strong class="app-title">Upper body</strong><div class="app-rows"><div class="app-row"><svg><use href="#barbell"/></svg><div><span>Panca piana</span><strong>Serie e ripetizioni</strong></div></div><div class="app-row"><svg><use href="#barbell"/></svg><div><span>Rematore</span><strong>Il tuo ultimo carico</strong></div></div><div class="app-row"><svg><use href="#check"/></svg><div><span>Registra i tuoi set</span><strong>Ritrova lo storico</strong></div></div></div>`};
const tabs=[...document.querySelectorAll('[data-view]')],panel=document.getElementById('mini-panel');
function selectTab(tab){tabs.forEach(button=>{button.setAttribute('aria-selected',String(button===tab));button.tabIndex=button===tab?0:-1});panel.innerHTML=content[tab.dataset.view];panel.setAttribute('aria-labelledby',tab.id)}
tabs.forEach((tab,index)=>{tab.onclick=()=>selectTab(tab);tab.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const target=event.key==='Home'?tabs[0]:event.key==='End'?tabs[tabs.length-1]:tabs[(index+1)%tabs.length];target.focus();selectTab(target)}}});

const journey = document.querySelector('[data-journey]');
const journeyTablist = journey.querySelector('[role="tablist"]');
const journeyTabs = [...journeyTablist.querySelectorAll('[role="tab"]')];
const journeyPanels = journeyTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

function selectJourneyTab(activeIndex, animate = true) {
  journeyTabs.forEach((tab, index) => {
    const active = index === activeIndex;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    journeyPanels[index].hidden = !active;
    journeyPanels[index].classList.toggle('is-current', active && animate);
  });
}

journeyTabs.forEach((tab, index) => {
  const panel = journeyPanels[index];
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  tab.addEventListener('click', () => selectJourneyTab(index));
  tab.addEventListener('keydown', event => {
    const destinations = {
      ArrowLeft: (index - 1 + journeyTabs.length) % journeyTabs.length,
      ArrowRight: (index + 1) % journeyTabs.length,
      Home: 0,
      End: journeyTabs.length - 1,
    };
    const next = destinations[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectJourneyTab(next);
    journeyTabs[next].focus();
  });
});

selectJourneyTab(0, false);
journeyTablist.hidden = false;
