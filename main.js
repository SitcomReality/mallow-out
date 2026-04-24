import { Game } from './src/game.js';

document.getElementById('newGame').addEventListener('click', ()=> {
  document.querySelector('.container').style.display = 'none';
  const gameContainer = document.getElementById('game');
  gameContainer.style.display = 'block';
  
  new Game(gameContainer);
});