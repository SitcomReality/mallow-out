document.getElementById('newGame').addEventListener('click', ()=> {
  // placeholder behavior for "New Game"
  // Replace this with navigation or game init when ready.
  document.getElementById('newGame').disabled = true;
  document.getElementById('newGame').textContent = 'Starting...';
  setTimeout(()=> {
    // reset to allow repeated clicks in this placeholder
    document.getElementById('newGame').disabled = false;
    document.getElementById('newGame').textContent = 'New Game';
  }, 800);
});