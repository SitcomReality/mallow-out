class SeededRandom {
  constructor(seed) {
    if (typeof seed === "string") {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      this.state = Math.abs(hash);
    } else {
      this.state = Math.abs(seed) || 123456789;
    }
  }

  next() {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  intRange(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
}

export function generateWonkyRectPaths(width, height, seedStr, options = { overshoot: 4, wobble: 1.5, minStep: 8, maxStep: 18 }) {
  if (width <= 0 || height <= 0) {
    return { fillPath: "", topPath: "", rightPath: "", bottomPath: "", leftPath: "" };
  }

  const rand = new SeededRandom(seedStr);
  const { overshoot, wobble, minStep, maxStep } = options;

  const getWobble = () => {
    const val = rand.range(-wobble, wobble);
    if (val < -0.6) return -1;
    if (val > 0.6) return 1;
    return 0;
  };

  const topPoints = [];
  let x = 0;
  while (x < width) {
    topPoints.push([x, getWobble()]);
    x += rand.intRange(minStep, maxStep);
  }
  topPoints.push([width, getWobble()]);

  const rightPoints = [];
  let y = 0;
  while (y < height) {
    rightPoints.push([width + getWobble(), y]);
    y += rand.intRange(minStep, maxStep);
  }
  rightPoints.push([width + getWobble(), height]);

  const bottomPoints = [];
  let bx = width;
  while (bx > 0) {
    bottomPoints.push([bx, height + getWobble()]);
    bx -= rand.intRange(minStep, maxStep);
  }
  bottomPoints.push([0, height + getWobble()]);

  const leftPoints = [];
  let ly = height;
  while (ly > 0) {
    leftPoints.push([getWobble(), ly]);
    ly -= rand.intRange(minStep, maxStep);
  }
  leftPoints.push([getWobble(), 0]);

  const fillPoints = [
    ...topPoints,
    ...rightPoints,
    ...bottomPoints,
    ...leftPoints,
    topPoints[0],
  ];

  const fillPath = fillPoints
    .map(([px, py], idx) => `${idx === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`)
    .join(" ") + " Z";

  const overL = rand.intRange(2, overshoot);
  const overR = rand.intRange(2, overshoot);
  const overT = rand.intRange(2, overshoot);
  const overB = rand.intRange(2, overshoot);

  const topPath =
    `M ${(-overL).toFixed(1)} ${topPoints[0][1].toFixed(1)} ` +
    topPoints.map(([px, py]) => `L ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ") +
    ` L ${(width + overR).toFixed(1)} ${topPoints[topPoints.length - 1][1].toFixed(1)}`;

  const rightPath =
    `M ${rightPoints[0][0].toFixed(1)} ${(-overT).toFixed(1)} ` +
    rightPoints.map(([px, py]) => `L ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ") +
    ` L ${rightPoints[rightPoints.length - 1][0].toFixed(1)} ${(height + overB).toFixed(1)}`;

  const bottomPath =
    `M ${(width + overR).toFixed(1)} ${bottomPoints[0][1].toFixed(1)} ` +
    bottomPoints.map(([px, py]) => `L ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ") +
    ` L ${(-overL).toFixed(1)} ${bottomPoints[bottomPoints.length - 1][1].toFixed(1)}`;

  const leftPath =
    `M ${leftPoints[0][0].toFixed(1)} ${(height + overB).toFixed(1)} ` +
    leftPoints.map(([px, py]) => `L ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ") +
    ` L ${leftPoints[leftPoints.length - 1][0].toFixed(1)} ${(-overT).toFixed(1)}`;

  return { fillPath, topPath, rightPath, bottomPath, leftPath };
}

export function applyWonkyUI() {
  const style = document.createElement('style');
  style.textContent = `
    .wonky {
      background: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      position: relative;
      z-index: 1;
    }
    .wonky-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }
  `;
  document.head.appendChild(style);

  const observer = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        updateWonkyElement(entry.target, entry.contentRect.width, entry.contentRect.height);
      }
    }
  });

  const attach = () => {
    document.querySelectorAll('.wonky').forEach(el => {
      if (!el.dataset.wonkyObserved) {
        el.dataset.wonkyObserved = 'true';
        if (getComputedStyle(el).position === 'static') {
          el.style.position = 'relative';
        }
        observer.observe(el);
        if (el.offsetWidth > 0) {
          updateWonkyElement(el, el.offsetWidth, el.offsetHeight);
        }
      }
    });
  };

  const mutationObserver = new MutationObserver((mutations) => {
    let shouldAttach = false;
    for (let m of mutations) {
      if (m.addedNodes.length > 0) {
        shouldAttach = true;
        break;
      }
    }
    if (shouldAttach) attach();
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
  attach();
  
  window.updateWonkyUI = attach;
}

function updateWonkyElement(el, width, height) {
  if (width === 0 || height === 0) return;
  
  const seed = el.dataset.seed || el.id || el.className || 'wonky';
  
  const paths = generateWonkyRectPaths(width, height, seed);
  
  let svg = el.querySelector(':scope > .wonky-svg');
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add('wonky-svg');
    el.insertBefore(svg, el.firstChild);
  }
  
  const fill = el.dataset.fill || '#ffffff';
  const stroke = el.dataset.stroke || '#000000';
  const strokeWidth = el.dataset.strokeWidth || '4';
  
  svg.innerHTML = `
    <g shape-rendering="crispEdges">
      <path class="wonky-fill" d="${paths.fillPath}" fill="${fill}" />
      <path class="wonky-stroke" d="${paths.topPath}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="square" />
      <path class="wonky-stroke" d="${paths.rightPath}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="square" />
      <path class="wonky-stroke" d="${paths.bottomPath}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="square" />
      <path class="wonky-stroke" d="${paths.leftPath}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="square" />
    </g>
  `;
}