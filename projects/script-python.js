// PYTHON CATEGORY SCRIPT
const cur = document.getElementById('cursor');
const crr = document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.left = mx + 'px'; cur.style.top = my + 'px'; });
(function anim(){ rx += (mx - rx) * .12; ry += (my - ry) * .12; crr.style.left = rx + 'px'; crr.style.top = ry + 'px'; requestAnimationFrame(anim); })();
document.querySelectorAll('a,button,.skill-chip,.project-card,.social-card,.contact-item,.category-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.style.width = '5px'; cur.style.height = '5px'; crr.style.width = '44px'; crr.style.height = '44px'; });
  el.addEventListener('mouseleave', () => { cur.style.width = '10px'; cur.style.height = '10px'; crr.style.width = '30px'; crr.style.height = '30px'; });
});

// HAMBURGER MENU
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if(hamburger && mobileMenu){
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

// TYPEWRITER
const phrases = ["SUNDAY AI is the main Python build.", "Chaos Ball is the game inside the Python category.", "Builds powered by Python, AI, and gameplay."];
let pi = 0, ci = 0, del = false;
const tw = document.getElementById('typewriter');
if(tw){
  function type(){
    const p = phrases[pi];
    if(!del){ tw.textContent = p.slice(0, ++ci); if(ci === p.length){ del = true; setTimeout(type, 2200); return; } setTimeout(type, 65); }
    else { tw.textContent = p.slice(0, --ci); if(ci === 0){ del = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return; } setTimeout(type, 28); }
  }
  type();
}

// SCROLL REVEAL
const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, {threshold:.1});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
