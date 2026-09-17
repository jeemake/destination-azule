(() => {
  'use strict';
  const root=document.documentElement;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const narrow=matchMedia('(max-width: 760px)');
  const journey=document.querySelector('.journey');
  const track=document.querySelector('.journey-track');
  const progress=document.querySelector('.reading-progress span');
  const journeyProgress=document.querySelector('.journey-progress span');
  const layers=[...document.querySelectorAll('[data-parallax]')];
  const motionButton=document.getElementById('motion-toggle');
  let reduced=media.matches, scheduled=false;
  try { const saved=localStorage.getItem('azule-motion'); if(saved!==null) reduced=saved==='off'; } catch {}
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  function draw(){
    scheduled=false;
    const y=window.scrollY,h=innerHeight;
    progress.style.transform=`scaleX(${clamp(y/(document.documentElement.scrollHeight-h||1),0,1)})`;
    if(!reduced){
      layers.forEach(el=>{
        const section=el.closest('section') || el.parentElement;
        const rect=section.getBoundingClientRect();
        if(rect.bottom>-h*.5&&rect.top<h*1.5){
          const delta=section.classList.contains('hero')?-rect.top:(h-rect.height)/2-rect.top;
          el.style.transform=`translate3d(0,${clamp(delta*Number(el.dataset.parallax),-130,130)}px,0)`;
        }
      });
      if(!narrow.matches){
        const rect=journey.getBoundingClientRect();
        const p=clamp(-rect.top/(journey.offsetHeight-h),0,1);
        track.style.transform=`translate3d(${-p*2*journey.clientWidth}px,0,0)`;
        journeyProgress.style.transform=`scaleX(${(1+p*2)/3})`;
      }
    }
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
  function setMotion(value){
    reduced=value;root.classList.toggle('motion-off',reduced);
    motionButton.textContent=reduced?'Animations réduites':'Animations activées';
    motionButton.setAttribute('aria-pressed',String(reduced));
    schedule();
  }
  setMotion(reduced);
  motionButton.addEventListener('click',()=>{setMotion(!reduced);try{localStorage.setItem('azule-motion',reduced?'off':'on');}catch{}});
  media.addEventListener('change',e=>setMotion(e.matches));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule);
  if(document.fonts)document.fonts.ready.then(schedule);
  const menuButton=document.querySelector('.menu-button'),menu=document.getElementById('mobile-menu');
  function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Ouvrir le menu');document.body.classList.remove('menu-open');}
  menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');document.body.classList.toggle('menu-open',open);});
  document.addEventListener('keydown',e=>{
    if(menu.hidden)return;
    if(e.key==='Escape'){closeMenu();menuButton.focus();}
    if(e.key==='Tab'){
      const links=[menuButton,...menu.querySelectorAll('a')];
      const first=links[0],last=links[links.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
    const target=document.querySelector(link.getAttribute('href'));if(!target)return;
    e.preventDefault();closeMenu();
    let top=target.getBoundingClientRect().top+window.scrollY;
    if(target.classList.contains('experience')&&!narrow.matches&&!reduced){
      const index=[...track.children].indexOf(target);
      top=journey.getBoundingClientRect().top+window.scrollY+(journey.offsetHeight-innerHeight)*index/2;
    } else if(!target.classList.contains('hero')) top-=20;
    window.scrollTo({top,behavior:reduced?'instant':'smooth'});
    history.replaceState(null,'',link.getAttribute('href'));
    target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
  }));
  const details=[...document.querySelectorAll('.universe-list details')];
  const universeImage=document.getElementById('universe-image');
  details.forEach(d=>d.addEventListener('toggle',()=>{if(d.open){details.forEach(other=>{if(other!==d)other.open=false;});universeImage.src=`assets/${d.dataset.image}.webp`;universeImage.alt=d.dataset.alt;}}));
  const dialog=document.getElementById('project-dialog');
  document.getElementById('project-info').addEventListener('click',()=>dialog.showModal());
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
})();
