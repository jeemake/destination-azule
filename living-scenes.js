(() => {
  'use strict';
  const root=document.documentElement;
  const hero=document.querySelector('.hero');
  const video=document.querySelector('.hero-video');
  const videoToggle=document.querySelector('.video-toggle');
  const stage=document.querySelector('.aqua-stage');
  const journey=document.querySelector('.journey');
  let reduced=root.classList.contains('motion-off'),userPaused=false,heroVisible=false,queued=false;
  const unit=n=>Math.min(1,Math.max(0,n));
  const ease=n=>{const t=unit(n);return t*t*(3-2*t);};
  function syncVideo(){
    videoToggle.hidden=reduced;
    if(reduced||userPaused||!heroVisible||document.hidden){video.pause();return;}
    if(!video.getAttribute('src'))video.src=innerWidth<=760?video.dataset.mobileSrc:video.dataset.src;
    video.play().then(()=>{
      // A play promise may settle after the visitor has left the scene.
      if(reduced||userPaused||!heroVisible||document.hidden){video.pause();return;}
      video.classList.add('is-ready');
    }).catch(()=>{videoToggle.innerHTML='<span aria-hidden="true">▷</span> Lire la vidéo';videoToggle.setAttribute('aria-label','Lire la vidéo');});
  }
  videoToggle.addEventListener('click',()=>{
    userPaused=video.paused?false:true;
    videoToggle.setAttribute('aria-pressed',String(userPaused));
    videoToggle.innerHTML=userPaused?'<span aria-hidden="true">▷</span> Lire la vidéo':'<span aria-hidden="true">Ⅱ</span> Pause vidéo';
    videoToggle.setAttribute('aria-label',userPaused?'Lire la vidéo':'Mettre la vidéo en pause');
    syncVideo();
  });
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncVideo();},{threshold:0}).observe(hero);
  document.addEventListener('visibilitychange',syncVideo);
  document.addEventListener('azule:motion',event=>{reduced=event.detail.reduced;syncVideo();schedule();});
  if(!stage)return;
  const world=stage.querySelector('.aqua-world');
  const assets=['aqua-background.webp','aqua-people.webp','aqua-spray.webp'];
  let ready=false;
  function loadLayers(){
    if(ready)return;
    ready=true;
    Promise.all(assets.map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=`assets/${name}`;})))
      .then(()=>{stage.classList.add('is-layered');schedule();}).catch(()=>{/* Keep the original photograph if any layer fails. */});
  }
  const near=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadLayers();near.disconnect();}},{rootMargin:'900px'});
  near.observe(stage);
  const set=(name,value,suffix='px')=>world.style.setProperty(name,`${value.toFixed(3)}${suffix}`);
  function draw(){
    queued=false;
    if(reduced||!ready)return;
    const h=innerHeight,rect=stage.getBoundingClientRect(),jr=journey.getBoundingClientRect();
    const desktop=innerWidth>760&&h>=640;
    const t=desktop?unit((h*.55-jr.top)/(h*.55+(jr.height-h)*.16)):unit((h*.88-rect.top)/(h*.70+rect.height*.3));
    const jump=Math.sin(Math.PI*t),react=Math.sin(Math.PI*unit((t-.12)/.88));
    const coverWidth=Math.max(rect.width,rect.height*1531/1027);
    world.style.setProperty('--aqua-cover-width',`${coverWidth.toFixed(2)}px`);
    const scale=coverWidth/1531;
    set('--aqua-back-x',(t-.5)*-25*scale);set('--aqua-back-y',(t-.5)*28*scale);
    set('--jump-y',(36-jump*158)*scale);set('--jump-x',jump*15*scale);set('--jump-turn',-jump*4,'deg');
    set('--friend-left-x',-react*12*scale);set('--friend-left-y',-react*17*scale);set('--friend-left-turn',-react*2,'deg');
    set('--friend-center-y',-react*12*scale);set('--friend-center-turn',react*1.3,'deg');
    set('--friend-woman-y',-react*19*scale);set('--friend-woman-turn',-react*1.5,'deg');
    set('--friend-right-x',react*13*scale);set('--friend-right-y',-react*14*scale);set('--friend-right-turn',react*2.2,'deg');
    set('--water-x',Math.sin(t*Math.PI*2)*17*scale);set('--water-y',Math.sin(t*Math.PI*2)*7*scale);
    const burst=ease((t-.38)/.62);
    set('--spray-x',burst*18*scale);set('--spray-y',(-Math.sin(burst*Math.PI)*70+burst*24)*scale);
    set('--spray-scale',.45+burst*.23,'');set('--spray-opacity',.3+Math.sin(burst*Math.PI)*.55,'');
    set('--ripple-scale',.65+burst*1.7,'');set('--ripple-opacity',Math.sin(burst*Math.PI)*.7,'');
    stage.dataset.phase=t<.28?'takeoff':t<.64?'airborne':'landing';
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(draw);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  schedule();
})();
