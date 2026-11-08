# Blade Aura: Duel

A third-person sword duel in a 3D arena. Your mouse moves the sword; blade speed is your damage.

## Run it
1. Easiest: double-click `index.html` (opens in your browser).
2. More reliable (recommended): open a terminal in this folder and run
   `python -m http.server 8000`, then visit http://localhost:8000
   (or `npx serve` if you use Node).
3. VS Code: install "Live Server", right-click `index.html`, choose "Open with Live Server".

## Controls
Mouse = sword | W A S D = move | Shift = sprint | Q E = turn | Space = dodge roll | Esc = pause

## Files
- index.html          page layout, HUD and menus, loads everything in order
- css/style.css       all styling
- lib/three.min.js    three.js r128 (3D engine), bundled so it works offline
- js/scene.js         renderer, camera, sky, lights, arena, pillars, torches, embers
- js/effects.js       spark/particle pool
- js/characters.js    knights, sword model, blade trail
- js/game.js          state, waves, enemy AI, damage, scoring
- js/sword.js         sword physics, hit detection, camera
- js/main.js          render frame, HUD, main loop, input

Scripts load in the order listed in index.html. They share one global scope, so keep that order.
