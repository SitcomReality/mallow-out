import { gameState } from '../game/state.js';
import { session } from '../game/manager.js';

/**
 * Mobile controls container kept for layout compatibility, but the explicit
 * bottom-right shoot button has been removed — tapping the canvas handles input.
 */
export function createMobileControls() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const container = document.createElement('div');
  container.id = 'mobileControls';
  container.className = 'mobile-controls';
  // Keep container in DOM so styles and layout won't shift, but do not inject any action buttons.
  document.body.appendChild(container);

  return {
    show() {
      if (!isMobile) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'block';
    },
    hide() {
      container.style.display = 'none';
    }
  };
}