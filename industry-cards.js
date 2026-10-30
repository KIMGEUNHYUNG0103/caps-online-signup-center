(()=>{
const root=document.querySelector('#solutions .industry-carousel');if(!root)return;
const track=root.querySelector('.industry-photo-track'),cards=[...track.querySelectorAll('.industry-photo-card')],dots=[...root.querySelectorAll('[data-slide]')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
let current=0,visible=false,manual=false,hovering=false,touching=false,userScrolling=false,resumeAt=0,scrollTimer;
function select(index){current=index;cards.forEach((c,i)=>c.classList.toggle('is-selected',i===index));dots.forEach((d,i)=>i===index?d.setAttribute('aria-current','true'):d.removeAttribute('aria-current'));}
function go(index){userScrolling=false;select((index+cards.length)%cards.length);track.scrollTo({left:Math.min(cards[current].offsetLeft-cards[0].offsetLeft,track.scrollWidth-track.clientWidth),behavior:reduced.matches?'instant':'smooth'});resumeAt=Date.now()+4500;}
const pause=document.createElement('button');pause.type='button';pause.className='industry-autoplay';
function updatePause(){pause.textContent=manual?'▷':'Ⅱ';pause.setAttribute('aria-label',manual?'자동 넘김 재생':'자동 넘김 일시정지');pause.setAttribute('aria-pressed',String(manual));}updatePause();root.querySelector('.industry-carousel-controls').append(pause);
pause.addEventListener('click',()=>{manual=!manual;resumeAt=Date.now()+4500;updatePause();});
track.addEventListener('mouseenter',()=>hovering=true);track.addEventListener('mouseleave',()=>hovering=false);
const beginScroll=()=>{userScrolling=true;resumeAt=Date.now()+4500;};
track.addEventListener('touchstart',()=>{touching=true;beginScroll();},{passive:true});
const endTouch=()=>{touching=false;resumeAt=Date.now()+4500;};track.addEventListener('touchend',endTouch,{passive:true});track.addEventListener('touchcancel',endTouch,{passive:true});track.addEventListener('wheel',beginScroll,{passive:true});track.addEventListener('pointerdown',beginScroll,{passive:true});
track.addEventListener('scroll',()=>{if(!userScrolling)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{let nearest=0;cards.forEach((c,i)=>{if(Math.abs(c.offsetLeft-cards[0].offsetLeft-track.scrollLeft)<Math.abs(cards[nearest].offsetLeft-cards[0].offsetLeft-track.scrollLeft))nearest=i;});select(nearest);resumeAt=Date.now()+4500;},120);},{passive:true});
cards.forEach((c,i)=>{c.addEventListener('mouseenter',()=>select(i));c.addEventListener('focus',()=>select(i));});dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));root.querySelector('.industry-prev').addEventListener('click',()=>go(current-1));root.querySelector('.industry-next').addEventListener('click',()=>go(current+1));new IntersectionObserver(entries=>visible=entries[0].isIntersecting,{threshold:.25}).observe(root);
setInterval(()=>{if(visible&&!manual&&!hovering&&!touching&&!track.contains(document.activeElement)&&!document.hidden&&!reduced.matches&&Date.now()>=resumeAt)go(current+1);},250);go(0);
})();
