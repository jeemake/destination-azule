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
  const heroScene=document.querySelector('.hero-scene');
  const hero=document.querySelector('.hero');
  const oceanScene=document.querySelector('.breath-scene');
  const ocean=document.querySelector('.breath');
  const oceanLines=[...document.querySelectorAll('.breath-line')];
  const wave=document.querySelector('.wave-intro');
  const waveLines=[...document.querySelectorAll('.wave-line')];
  const arrival=document.querySelector('.arrival');
  const calm=document.querySelector('.calm-layout');
  const footer=document.querySelector('.footer');
  const scenes=[...document.querySelectorAll('.experience')];
  const sceneLinks=[...document.querySelectorAll('.scene-nav a')];
  const stops=[.06,.5,.94];
  let reduced=media.matches, scheduled=false;
  try { const saved=localStorage.getItem('azule-motion'); if(saved!==null) reduced=saved==='off'; } catch {}
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const unit=n=>clamp(n,0,1);
  const smooth=(a,b,n)=>{const t=unit((n-a)/(b-a));return t*t*(3-2*t);};
  const css=(el,name,value,unit='')=>el.style.setProperty(name,`${Number(value.toFixed(3))}${unit}`);
  const crossing=(r,h)=>unit((h-r.top)/(h+r.height));
  function layout(){
    root.classList.toggle('cinematic',!reduced&&innerHeight>=640);
    schedule();
  }
  function draw(){
    scheduled=false;
    const y=window.scrollY,h=innerHeight;
    progress.style.transform=`scaleX(${clamp(y/(document.documentElement.scrollHeight-h||1),0,1)})`;
    if(reduced)return;
    // Read geometry together, before setting any frame styles. No wheel interception.
    const hr=heroScene.getBoundingClientRect(),or=oceanScene.getBoundingClientRect();
    const wr=wave.getBoundingClientRect(),ar=arrival.getBoundingClientRect();
    const cr=calm.getBoundingClientRect(),fr=footer.getBoundingClientRect();
    const jr=journey.getBoundingClientRect(),width=journey.clientWidth;
    const sr=scenes.map(s=>s.getBoundingClientRect());
    const lr=layers.map(el=>({el,rect:el.closest('.arrival,.calm-layout').getBoundingClientRect(),room:Math.max(0,(el.offsetHeight-el.parentElement.clientHeight)/2-12)}));
    const mobile=narrow.matches,amplitude=mobile?.55:1;
    const hp=unit(-hr.top/Math.max(1,hr.height-h));
    css(hero,'--hero-zoom',1+hp*.24);
    css(hero,'--hero-y',hp*h*.07,'px');
    css(hero,'--title-x',-hp*width*.19*amplitude,'px');
    css(hero,'--title-y',-hp*h*.18,'px');
    css(hero,'--subtitle-y',-hp*h*.07,'px');
    css(hero,'--hero-copy-opacity',1-smooth(.35,.9,hp));
    css(hero,'--hero-ui-opacity',1-smooth(.25,.72,hp));
    css(hero,'--badge-y',-hp*160*amplitude,'px');
    css(hero,'--badge-turn',hp*35,'deg');
    lr.forEach(({el,rect,room})=>{
      const delta=((h-rect.height)/2-rect.top)*Number(el.dataset.parallax)*amplitude;
      el.style.transform=`translate3d(0,${clamp(delta,-room,room)}px,0) scale(1.04)`;
    });
    const ap=crossing(ar,h)*2-1;
    css(arrival,'--arrival-caption-y',-ap*105,'px');
    css(arrival,'--arrival-pattern-y',ap*155*amplitude,'px');
    css(arrival,'--arrival-pattern-turn',ap*18,'deg');
    const wp=crossing(wr,h);
    waveLines.forEach((line,i)=>css(line,'--wave-x',(1-smooth(.12,.63,wp))*(i===1?1:-1)*(mobile?52:190),'px'));
    css(wave,'--wave-pattern-y',(wp-.5)*240*amplitude,'px');
    css(wave,'--wave-pattern-scale',.86+wp*.38);
    if(!mobile&&h>=640){
      const p=unit(-jr.top/Math.max(1,jr.height-h));
      // Hold each complete scene long enough to read before travelling onward.
      const travel=smooth(.13,.4,p)+smooth(.6,.87,p);
      track.style.transform=`translate3d(${-travel*width}px,0,0)`;
      journeyProgress.style.transform=`scaleX(${(1+travel)/3})`;
      scenes.forEach((scene,i)=>{
        const offset=clamp(i-travel,-1,1);
        css(scene,'--photo-x',-offset*width*.075,'px');
        css(scene,'--photo-zoom',1+Math.abs(offset)*.06);
        css(scene,'--copy-x',offset*width*.065,'px');
        css(scene,'--copy-y',Math.abs(offset)*35,'px');
      });
      const current=Math.round(travel);
      sceneLinks.forEach((link,i)=>{if(i===current)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    }else{
      track.style.transform='none';
      scenes.forEach((scene,i)=>{
        const p=crossing(sr[i],h)*2-1;
        css(scene,'--mobile-photo-y',-p*75,'px');
        css(scene,'--mobile-copy-y',-p*24,'px');
        css(scene,'--copy-x',0,'px');css(scene,'--copy-y',0,'px');
      });
    }
    const op=unit(-or.top/Math.max(1,or.height-h));
    const entry=smooth(0,1,(h-or.top)/h);
    css(ocean,'--ocean-inset',(1-entry)*(mobile?5:10),'%');
    css(ocean,'--ocean-radius',(1-entry)*90,'px');
    css(ocean,'--ocean-zoom',1.28-op*.25);
    css(ocean,'--ocean-y',-op*h*.07,'px');
    oceanLines.forEach((line,i)=>{const reveal=smooth(i*.23,.23+i*.26,op);css(line,'--line-y',(1-reveal)*90,'px');css(line,'--line-opacity',reveal);});
    css(ocean,'--ocean-kicker',1-op*.65);
    css(ocean,'--ocean-kicker-y',-op*40,'px');
    css(ocean,'--ocean-link',smooth(.5,.72,op));
    // Outside the pinned layout, preserve every line in its normal readable state.
    if(h<640){oceanLines.forEach(line=>{css(line,'--line-y',0);css(line,'--line-opacity',1);});}
    const cp=crossing(cr,h);
    css(calm,'--calm-frame-y',(cp-.5)*-90*amplitude,'px');
    css(calm,'--calm-radius',44-smooth(.15,.85,cp)*29,'%');
    css(calm,'--calm-pattern-y',(cp-.5)*230*amplitude,'px');
    css(calm,'--calm-turn',(cp-.5)*-28,'deg');
    const fp=crossing(fr,h);
    css(footer,'--footer-word-y',(1-smooth(.1,.65,fp))*65,'px');
    css(footer,'--footer-pattern-y',(fp-.5)*-120,'px');
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
  function setMotion(value){
    reduced=value;root.classList.toggle('motion-off',reduced);
    motionButton.textContent=reduced?'Animations réduites':'Animations activées';
    motionButton.setAttribute('aria-pressed',String(reduced));
    layout();
  }
  setMotion(reduced);
  motionButton.addEventListener('click',()=>{setMotion(!reduced);try{localStorage.setItem('azule-motion',reduced?'off':'on');}catch{}});
  media.addEventListener('change',e=>setMotion(e.matches));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',layout,{passive:true});
  window.addEventListener('load',schedule);
  if(document.fonts)document.fonts.ready.then(schedule);
  if('ResizeObserver' in window)new ResizeObserver(schedule).observe(document.body);
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
    if(target.classList.contains('hero'))top=heroScene.getBoundingClientRect().top+window.scrollY;
    else if(target.classList.contains('experience')&&!narrow.matches&&!reduced&&innerHeight>=640){
      const index=[...track.children].indexOf(target);
      top=journey.getBoundingClientRect().top+window.scrollY+(journey.offsetHeight-innerHeight)*stops[index];
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
