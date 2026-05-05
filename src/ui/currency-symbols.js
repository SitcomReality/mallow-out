/**
 * Canonical SVG paths and colors for the game's currencies and items.
 */
export const CURRENCY_PATHS = {
  marsh: {
    path: 'M12 2.5c-0.5 0-1 0.2-1.3 0.7L5.5 12c-1 1.5-1.5 3-1.5 4.5 0 4.4 3.6 8 8 8s8-3.6 8-8c0-1.5-0.5-3-1.5-4.5l-5.2-8.8c-0.3-0.5-0.8-0.7-1.3-0.7z',
    color: '#8afdff',
    viewBox: '0 0 24 24'
  },
  pollen: {
    path: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z',
    color: '#ffd700',
    viewBox: '0 0 24 24'
  },
  caramel: {
    path: 'M5 5h14c1 0 2 1 2 2v10c0 1-1 2-2 2H5c-1 0-2-1-2-2V7c0-1 1-2 2-2z M7 8v8M17 8v8',
    color: '#ff8c00',
    viewBox: '0 0 24 24'
  },
  treat: {
    path: 'M4 8h16v11c0 1-1 2-2 2H6c-1 0-2-1-2-2V8z M3 5h18v3H3V5z M12 5V2 M9 5s0-3 3-3 3 3 3 3',
    color: '#ff69b4',
    viewBox: '0 0 24 24'
  }
};

/**
 * Returns a complete SVG string for the specified currency.
 */
export function getCurrencySVG(type, size = 16, extraClass = '') {
  const config = CURRENCY_PATHS[type];
  if (!config) return '';

  return `
    <svg 
      width="${size}" 
      height="${size}" 
      viewBox="${config.viewBox}" 
      class="currency-svg ${extraClass}" 
      style="display: inline-block; vertical-align: middle;"
    >
      <path 
        d="${config.path}" 
        fill="${config.color}" 
        stroke="#000000" 
        stroke-width="1.5" 
        stroke-linejoin="round"
      />
    </svg>
  `;
}