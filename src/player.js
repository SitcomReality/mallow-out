import * as THREE from 'three';
import { CONSTANTS } from './constants.js';

export class Player {
  constructor() {
    this.position = new THREE.Vector3(0, CONSTANTS.PLAYER_HEIGHT, 5);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.velocity = new THREE.Vector3();
    this.health = 100;
    
    // Camera vectors
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0);
  }
  
  updateVectors() {
    // Calculate forward and right vectors from rotation
    this.forward.set(0, 0, -1).applyEuler(this.rotation);
    this.right.set(1, 0, 0).applyEuler(this.rotation);
  }
  
  update(dt, moveInput) {
    this.updateVectors();
    
    // Movement
    const moveDir = new THREE.Vector3();
    if (moveInput.forward) moveDir.add(this.forward);
    if (moveInput.back) moveDir.sub(this.forward);
    if (moveInput.left) moveDir.sub(this.right);
    if (moveInput.right) moveDir.add(this.right);
    
    moveDir.y = 0;
    if (moveDir.length() > 0) {
      moveDir.normalize();
      const speed = moveInput.sprint ? CONSTANTS.PLAYER_SPEED * CONSTANTS.PLAYER_SPRINT_MULT : CONSTANTS.PLAYER_SPEED;
      this.velocity.copy(moveDir.multiplyScalar(speed));
    } else {
      this.velocity.multiplyScalar(0.8); // friction
    }
    
    this.position.add(this.velocity.clone().multiplyScalar(dt));
  }
  
  rotate(deltaX, deltaY) {
    this.rotation.y -= deltaX * CONSTANTS.MOUSE_SENSITIVITY;
    this.rotation.x -= deltaY * CONSTANTS.MOUSE_SENSITIVITY;
    // Clamp vertical rotation
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
  }
}