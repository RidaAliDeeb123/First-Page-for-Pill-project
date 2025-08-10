// script.js - controls the drop, bubbles and dissolve sequence
(function(){
  const pillBlue = document.getElementById('pill-blue');
  const pillPink = document.getElementById('pill-pink');
  const seaLeft = document.getElementById('sea-left');
  const seaRight = document.getElementById('sea-right');
  const stats = document.getElementById('stats');
  const replayBtn = document.getElementById('replay');

  // Timings (ms)
  const dropDelay = 600;
  const dropDuration = 1200;
  const blueDissolve = 3000; // blue dissolves faster
  const pinkDissolve = 6000; // pink dissolves slower (twice)
  const bubbleInterval = 180;

  function resetState(){
    // remove classes and bubbles
    [pillBlue, pillPink].forEach(p=>{
      p.classList.remove('dropped','dissolving');
      p.style.setProperty('--ty','-260px');
      p.style.removeProperty('--land-y');
      const overlay = p.querySelector('.overlay');
      overlay.style.height = '0%';
    });
    clearBubbles(seaLeft);
    clearBubbles(seaRight);
    stats.classList.add('hidden');
  }

  function clearBubbles(sea){
    const bs = sea.querySelectorAll('.bubble');
    bs.forEach(b=>b.remove());
  }

  function startSequence(){
    resetState();
    // drop pills after short delay
    setTimeout(()=>{
      // compute landing position roughly (center of sea area)
      const seaH = seaLeft.clientHeight;
      const landY = Math.round(seaH * 0.55);
      [pillBlue, pillPink].forEach(p=> p.style.setProperty('--land-y', landY + 'px'));
      // trigger drop
      pillBlue.classList.add('dropped');
      pillPink.classList.add('dropped');

      // after dropDuration start bubble spawn and dissolving
      setTimeout(()=> {
        startBubbles(seaLeft, blueDissolve);
        startBubbles(seaRight, pinkDissolve);

        // start dissolving overlay and scale fade
        dissolvePill(pillBlue, blueDissolve);
        dissolvePill(pillPink, pinkDissolve);

        // show stats after the slowest dissolve finishes + small pause
        const total = Math.max(blueDissolve, pinkDissolve) + 800;
        setTimeout(()=> {
          showStats();
        }, total);

      }, dropDuration + 80);

    }, dropDelay);
  }

  function dissolvePill(pill, duration){
    const overlay = pill.querySelector('.overlay');
    // set transition duration to match
    overlay.style.transition = `height ${duration}ms linear`;
    // start dissolve
    pill.classList.add('dissolving');
    // after a tiny timeout set overlay to full height (triggers transition)
    setTimeout(()=> overlay.style.height = '100%', 30);

    // also fade & shrink gently during dissolve
    pill.style.transition = `transform ${duration}ms ease, opacity ${Math.max(800, Math.floor(duration/3))}ms ease`;
    setTimeout(()=> {
      pill.style.opacity = '0.06';
      pill.style.transform = `translateX(-50%) translateY(${pill.style.getPropertyValue('--land-y') || '160px'}) scale(0.64)`;
    }, Math.floor(duration*0.45));
  }

  function startBubbles(sea, duration){
    const endTime = Date.now() + duration;
    const spawn = () => {
      if(Date.now() > endTime) return;
      spawnBubbleIn(sea);
      setTimeout(spawn, Math.random() * bubbleInterval + 80);
    };
    spawn();
  }

  function spawnBubbleIn(sea){
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 18 + 6;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = (10 + Math.random() * 80) + '%';
    const dur = (Math.random() * 1.8 + 2.4);
    b.style.animationDuration = dur + 's';
    sea.appendChild(b);
    // remove after animation
    setTimeout(()=> b.remove(), dur * 1000 + 80);
  }

  function showStats(){
    // simple bar-fill animation (just reveal overlay and bars)
    stats.classList.remove('hidden');
    // animate bar widths
    const manBar = stats.querySelector('.bar.man');
    const womanBar = stats.querySelector('.bar.woman');
    // set starting widths small and then animate
    manBar.style.width = '60%';
    womanBar.style.width = '35%';
    // subtle pulse on values
    setTimeout(()=> {
      manBar.querySelector('.value').style.opacity = '1';
      womanBar.querySelector('.value').style.opacity = '1';
    }, 420);
  }

  // wire replay
  replayBtn.addEventListener('click', ()=>{
    startSequence();
  });

  // also allow clicking the stage to replay
  document.getElementById('stage').addEventListener('click', ()=> startSequence());

  // start once on load
  window.addEventListener('load', ()=> {
    // small initial delay for polish
    setTimeout(startSequence, 600);
  });
})();
