// Shared motion + i18n for the saturated-ground site directions.
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. Split [data-split] into masked word spans (preserves child spans' class) ── */
function splitOne(el){
  const parts=[];
  el.childNodes.forEach(n=>{
    const cls = n.nodeType===1 ? (n.className||'') : '';
    (n.textContent||'').trim().split(/\s+/).filter(Boolean).forEach(w=>parts.push({w,cls}));
  });
  el.textContent='';
  parts.forEach((p,i)=>{
    const m=document.createElement('span'); m.className='wm';
    const s=document.createElement('span'); s.className='wi'+(p.cls?' '+p.cls:''); s.textContent=p.w;
    s.style.transitionDelay=(i*55)+'ms'; m.appendChild(s); el.appendChild(m);
    el.appendChild(document.createTextNode(' '));
  });
}
// skip headlines that are already split, so a second pass can never nest spans
function split(){ document.querySelectorAll('[data-split]').forEach(el=>{ if(!el.querySelector('.wm')) splitOne(el); }); }

/* ── 2. Language toggle (EN default, data-de holds the German string) ── */
function i18n(){
  const nodes=[...document.querySelectorAll('[data-de]')];
  nodes.forEach(el=>{ if(!el.dataset.en) el.dataset.en=el.innerHTML.replace(/\s+/g,' ').trim(); });
  const btns=[...document.querySelectorAll('[data-lang]')];
  const apply=(l,initial)=>{
    nodes.forEach(el=>{
      const t = l==='de' ? el.dataset.de : el.dataset.en;
      // initial pass runs before split()/reveals: swap text only, let them split + animate
      if(initial){ if(l==='de') el.innerHTML=t; return; }
      if(el.hasAttribute('data-split')){ el.innerHTML=t; splitOne(el); el.classList.add('in'); }
      else el.innerHTML=t;
    });
    document.documentElement.lang=l;
    btns.forEach(b=>b.setAttribute('aria-current', b.dataset.lang===l ? 'true':'false'));
    try{ localStorage.setItem('ds-site-lang',l); }catch(e){}
    document.dispatchEvent(new CustomEvent('langchange',{detail:l}));
  };
  btns.forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault(); if(b.getAttribute('aria-current')!=='true') apply(b.dataset.lang);
  }));
  let saved=null; try{ saved=localStorage.getItem('ds-site-lang'); }catch(e){}
  const q=new URLSearchParams(location.search).get('lang'); if(q==='de'||q==='en') saved=q;
  return ()=>apply(saved==='de' ? 'de' : 'en', true);
}

/* ── 3. Reveal on scroll ── */
function reveals(){
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -10% 0px',threshold:0.08});
  document.querySelectorAll('[data-rv],[data-split]').forEach(el=>{
    if(RM){ el.classList.add('in'); return; }
    io.observe(el);
  });
}

/* ── 4. Parallax ── */
function parallax(){
  if(RM) return;
  const els=[...document.querySelectorAll('[data-para]')];
  if(!els.length) return;
  let raf=null;
  const tick=()=>{
    const vh=innerHeight;
    els.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.bottom<-200||r.top>vh+200) return;
      const p=(r.top+r.height/2-vh/2)/vh;
      el.style.transform='translate3d(0,'+(-p*parseFloat(el.dataset.para)*100).toFixed(2)+'px,0)';
    });
    raf=null;
  };
  const on=()=>{ if(!raf) raf=requestAnimationFrame(tick); };
  addEventListener('scroll',on,{passive:true}); addEventListener('resize',on); tick();
}

/* ── 5. Horizontal chapter: vertical scroll drives sideways travel ── */
function hscroll(){
  const sec=document.querySelector('[data-hscroll]'); if(!sec) return;
  const track=sec.querySelector('[data-htrack]'); if(!track) return;
  const live=()=>innerWidth>900 && !RM;
  const on=()=>{
    if(!live()){ track.style.transform=''; return; }
    const r=sec.getBoundingClientRect();
    const total=sec.offsetHeight-innerHeight;
    const p=Math.min(Math.max(-r.top/total,0),1);
    const max=Math.max(track.scrollWidth-innerWidth+80,0);
    track.style.transform='translate3d('+(-p*max).toFixed(1)+'px,0,0)';
  };
  addEventListener('scroll',on,{passive:true}); addEventListener('resize',on); on();
}

/* ── 6. Drag-to-scroll rails ── */
function drag(){
  document.querySelectorAll('[data-drag]').forEach(rail=>{
    let down=false,x0=0,l0=0;
    rail.addEventListener('pointerdown',e=>{down=true;x0=e.clientX;l0=rail.scrollLeft;rail.classList.add('grab')});
    rail.addEventListener('pointermove',e=>{if(down)rail.scrollLeft=l0-(e.clientX-x0)});
    const up=()=>{down=false;rail.classList.remove('grab')};
    rail.addEventListener('pointerup',up); rail.addEventListener('pointercancel',up); rail.addEventListener('pointerleave',up);
  });
}

/* ── 7. Hover-swap preview list ── */
function swap(){
  const stage=document.querySelector('[data-stage]'); if(!stage) return;
  const imgs=[...stage.querySelectorAll('img')];
  document.querySelectorAll('[data-swap]').forEach(row=>{
    const show=()=>{
      imgs.forEach(im=>im.classList.toggle('on',im.dataset.key===row.dataset.swap));
      document.querySelectorAll('[data-swap]').forEach(r=>r.classList.toggle('active',r===row));
    };
    row.addEventListener('mouseenter',show); row.addEventListener('focus',show);
  });
  if(imgs[0]) imgs[0].classList.add('on');
  const first=document.querySelector('[data-swap]'); if(first) first.classList.add('active');
}

/* ── 8b. Lightbox ── */
function lightbox(){
  const lb=document.querySelector('[data-lbox]'); if(!lb) return;
  const im=lb.querySelector('img'), cap=lb.querySelector('.cap');
  const close=()=>{ lb.classList.remove('on'); document.body.classList.remove('locked'); };
  document.querySelectorAll('[data-lb]').forEach(el=>{
    el.addEventListener('click',()=>{
      const pick = el.querySelector('img.on') || el.querySelector('img');
      if(!pick) return;
      im.src = pick.dataset.full || pick.src; im.alt = pick.alt || '';
      cap.textContent = pick.alt || '';
      lb.classList.add('on'); document.body.classList.add('locked');
    });
  });
  lb.addEventListener('click',close);
  addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
}

/* ── 9. Scroll progress ── */
function progress(){
  const bar=document.querySelector('[data-progress]'); if(!bar) return;
  const on=()=>{const h=document.documentElement;bar.style.transform='scaleX('+(h.scrollTop/(h.scrollHeight-h.clientHeight)||0)+')'};
  addEventListener('scroll',on,{passive:true}); on();
}

/* ── 10. Counters ── */
function counters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const to=parseFloat(el.dataset.count);
    if(RM){el.textContent=to;return}
    const io=new IntersectionObserver(es=>{es.forEach(e=>{
      if(!e.isIntersecting) return; io.disconnect();
      const t0=performance.now(),d=1200;
      const step=n=>{const p=Math.min((n-t0)/d,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};
      requestAnimationFrame(step);
    })},{threshold:0.6});
    io.observe(el);
  });
}

/* ── 11. Intro curtain ── */
function intro(done){
  const cur=document.querySelector('[data-intro]');
  let seen=false; try{ seen=sessionStorage.getItem('ds-site-intro')==='1'; }catch(e){}
  if(!cur || RM || seen){ if(cur) cur.remove(); document.body.classList.remove('locked'); done(); return; }
  document.body.classList.add('locked');
  requestAnimationFrame(()=>cur.classList.add('go'));
  setTimeout(()=>{
    cur.classList.add('out');
    document.body.classList.remove('locked');
    done();
    setTimeout(()=>cur.remove(),1100);
    try{ sessionStorage.setItem('ds-site-intro','1'); }catch(e){}
  },1900);
}

addEventListener('DOMContentLoaded',()=>{
  const applyLang=i18n();
  applyLang();
  split(); reveals(); parallax(); hscroll(); drag(); swap(); lightbox(); progress(); counters();
  document.body.classList.add('ready');
  intro(()=>{
    document.querySelectorAll('.hero [data-split],.hero [data-rv]').forEach(el=>el.classList.add('in'));
  });
});
