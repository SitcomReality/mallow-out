import { gameState } from '../game/state.js';
import { getPetalById } from '../game/petals/petal-types.js';

export function createPetalHUD() {
  const container = document.createElement('div');
  container.id = 'petalHUD';
  container.className = 'petal-hud';
  document.body.appendChild(container);
  
  const N = 5, c = 80, r = 36, h = 44; 
  const NS = 'http://www.w3.org/2000/svg';
  
  container.innerHTML = `
    <div class="petal-display wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="4">
      <div class="petal-label" style="font-size: 8px; color: #000000;">Petals</div>
      <svg id="petalStar" width="${c*2}" height="${c*2}" viewBox="0 0 ${c*2} ${c*2}"></svg>
    </div>
  `;
  
  const svg = container.querySelector('#petalStar');
  const pts = [...Array(N)].map((_, i) => {
    let a = -Math.PI / 2 + i * 2 * Math.PI / N;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  });
  
  const petals = [];
  const labels = [];
  
  function el(t, a) {
    let e = document.createElementNS(NS, t);
    for (let k in a) e.setAttribute(k, a[k]);
    return e;
  }
  
  for (let i = 0; i < N; i++) {
    let a = pts[i], b = pts[(i + 1) % N];
    let m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let v = [m[0] - c, m[1] - c];
    let l = Math.hypot(...v);
    let tip = [m[0] + v[0] / l * h, m[1] + v[1] / l * h];
    
    petals[i] = el('polygon', { class: 'petal', points: [a, b, tip].map(p => p.join(',')).join(' ') });
    svg.append(petals[i]);
    
    labels[i] = el('text', { class: 'emoji', x: (m[0] + tip[0]) / 2, y: (m[1] + tip[1]) / 2 });
    labels[i].style.dominantBaseline = "central";
    labels[i].style.textAnchor = "middle";
    labels[i].style.fontSize = "24px";
    svg.append(labels[i]);
  }
  
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.append(el('polygon', { class: 'core', points: pts.map(p => p.join(',')).join(' ') }));
  
  function update() {
    gameState.equippedPetals.forEach((petalId, idx) => {
      const petal = petalId ? getPetalById(petalId) : null;
      const empty = '💨';
      
      if (petal) {
        petals[idx].classList.add('on');
        labels[idx].textContent = petal.icon;
        
        let title = petals[idx].querySelector('title');
        if (!title) {
            title = el('title', {});
            petals[idx].append(title);
        }
        title.textContent = `${petal.name}: ${petal.description}`;
        
      } else {
        petals[idx].classList.remove('on');
        labels[idx].textContent = empty;
        
        let title = petals[idx].querySelector('title');
        if (!title) {
            title = el('title', {});
            petals[idx].append(title);
        }
        title.textContent = `Empty - will grant Caramel Vapor (20-30% of earned Caramel)`;
      }
    });
  }
  
  return {
    show() {
      container.style.display = 'block';
      update();
    },
    hide() {
      container.style.display = 'none';
    },
    update,
    animateTrigger(idx) {
       petals[idx].classList.remove('zap');
       labels[idx].classList.remove('spent');
       void petals[idx].offsetWidth; // force reflow
       petals[idx].classList.add('zap');
       labels[idx].classList.add('spent');
       
       setTimeout(() => {
           petals[idx].classList.remove('zap');
           labels[idx].classList.remove('spent');
       }, 500);
    }
  };
}