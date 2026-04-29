import * as THREE from 'three';

export class FloatingTextSystem {
  constructor() {
    this.texts = [];
  }

  createDamageText(position, damage, isCritical = false) {
    this.texts.push({
      position: position.clone(),
      text: Math.floor(damage).toString(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        2.0 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.5
      ),
      life: 1.0,
      maxLife: 1.0,
      type: isCritical ? 'critical' : 'damage',
      scale: isCritical ? 1.5 : 1.0
    });
  }

  createInfoText(position, text, type = 'info') {
    this.texts.push({
      position: position.clone(),
      text,
      velocity: new THREE.Vector3(0, 1.5, 0),
      life: 1.5,
      maxLife: 1.5,
      type,
      scale: 1.2
    });
  }

  update(delta) {
    const toRemove = [];
    
    for (const text of this.texts) {
      text.life -= delta;
      
      if (text.life <= 0) {
        toRemove.push(text);
        continue;
      }
      
      text.position.x += text.velocity.x * delta;
      text.position.y += text.velocity.y * delta;
      text.position.z += text.velocity.z * delta;
      
      text.velocity.y -= 2.0 * delta; // Gravity
    }
    
    for (const text of toRemove) {
      const idx = this.texts.indexOf(text);
      if (idx > -1) this.texts.splice(idx, 1);
    }
  }

  getTexts() {
    return this.texts;
  }

  clear() {
    this.texts = [];
  }
}