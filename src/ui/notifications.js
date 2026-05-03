import { applyWonkyUI } from './wonky.js';

export function createNotificationSystem() {
  const container = document.getElementById('notificationContainer');
  let notifications = [];
  const NOTIFICATION_DURATION = 3000; // 3 seconds

  function render() {
    // Clear all button if any sticky notifications exist
    const hasSticky = notifications.some(n => n.sticky);
    let html = '';
    
    if (hasSticky) {
      html += `<button id="clearAllNotifications" class="notification-clear-all wonky" data-fill="#ffffff" data-stroke="#000000" data-stroke-width="2">Clear All</button>`;
    }

    html += notifications.map(n => {
      const isCollapsed = n.sticky && n.timer <= 0;
      const multiplierHtml = n.count > 1 ? `<div class="notification-multiplier">x${n.count}</div>` : '';
      
      return `
        <div class="notification-item ${n.sticky ? 'sticky' : 'slippery'} ${isCollapsed ? 'collapsed' : ''} ${n.leaving ? 'leaving' : ''}" id="notif-${n.internalId}">
          <div class="notification-close">×</div>
          <div class="notification-content wonky" data-fill="${n.color || '#ffffff'}" data-stroke="#000000" data-stroke-width="3">
            <div class="notification-header">
              <div class="notification-title">${n.title}</div>
              ${multiplierHtml}
            </div>
            <div class="notification-body">
              ${n.text.replace('{v}', Math.floor(n.value))}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Re-bind events
    if (hasSticky) {
      container.querySelector('#clearAllNotifications').addEventListener('click', () => {
        notifications = notifications.filter(n => !n.sticky);
        render();
      });
    }

    container.querySelectorAll('.notification-item').forEach(el => {
      const id = el.id.replace('notif-', '');
      el.querySelector('.notification-close').addEventListener('click', (e) => {
        e.stopPropagation();
        notifications = notifications.filter(n => n.internalId !== id);
        render();
      });
    });

    if (window.updateWonkyUI) window.updateWonkyUI();
  }

  function addNotification(config) {
    const { id, sticky, title, text, value = 0, color = '#ffffff' } = config;
    
    // Find equivalent
    const existing = notifications.find(n => n.id === id);
    
    if (existing) {
      // Update aggregated data without re-triggering full arrival animation
      existing.value += value;
      existing.count += 1;
      existing.timer = NOTIFICATION_DURATION;
      existing.leaving = false;

      // Update the existing DOM element in-place to avoid re-running slide-in.
      const el = document.getElementById('notif-' + existing.internalId);
      if (el) {
        // Update multiplier badge and body text
        const mult = el.querySelector('.notification-multiplier');
        if (existing.count > 1) {
          if (mult) {
            mult.textContent = `x${existing.count}`;
          } else {
            const header = el.querySelector('.notification-header');
            if (header) {
              const m = document.createElement('div');
              m.className = 'notification-multiplier';
              m.textContent = `x${existing.count}`;
              header.insertAdjacentElement('beforeend', m);
            }
          }
        } else if (mult) {
          mult.remove();
        }
        const body = el.querySelector('.notification-body');
        if (body) {
          body.innerHTML = existing.text.replace('{v}', Math.floor(existing.value));
        }

        // Brief pulsate/flash to indicate stacking (no slide-in)
        const content = el.querySelector('.notification-content');
        if (content) {
          content.classList.remove('pulsate');
          // force reflow to restart animation
          void content.offsetWidth;
          content.classList.add('pulsate');
          // remove pulsate class after animation completes
          setTimeout(() => content.classList.remove('pulsate'), 600);
        }
      }

      // No need to fully re-render; updated DOM handled above.
      return;
    } else {
      notifications.push({
        internalId: Math.random().toString(36).substr(2, 9),
        id,
        sticky,
        title,
        text,
        value,
        color,
        count: 1,
        timer: NOTIFICATION_DURATION,
        leaving: false
      });
    }
    render();
  }

  function update(deltaMs) {
    let changed = false;
    for (let i = notifications.length - 1; i >= 0; i--) {
      const n = notifications[i];
      const oldTimer = n.timer;
      n.timer -= deltaMs;

      // Handle collapsing for sticky
      if (n.sticky && oldTimer > 0 && n.timer <= 0) {
        changed = true;
      }

      // Handle dissipation for slippery
      if (!n.sticky && n.timer <= 0) {
        if (!n.leaving) {
          n.leaving = true;
          changed = true;
          // Clean up after animation
          setTimeout(() => {
            notifications = notifications.filter(item => item !== n);
            render();
          }, 300);
        }
      }
    }
    
    if (changed) render();
  }

  // Poll for updates (simple interval for UI timers)
  setInterval(() => {
    update(100);
  }, 100);

  return {
    add: addNotification
  };
}