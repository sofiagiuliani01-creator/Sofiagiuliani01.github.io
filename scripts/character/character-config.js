(function () {
  window.CharacterSequenceConfig = {
    frameExt: 'webp',
    defaultFps: 24,
    responsive: {
      desktopWidth: 172,
      mobileWidth: 120,
      mobileBreakpoint: 900
    },
    sequences: {
      pullup: { folder: 'assets/character/pullup', prefix: 'pullup_', frames: 24, loop: true, fps: 24 },
      jump: { folder: 'assets/character/jump', prefix: 'jump_', frames: 18, loop: false, fps: 30 },
      land: { folder: 'assets/character/land', prefix: 'land_', frames: 14, loop: false, fps: 24 },
      'card-1': { folder: 'assets/character/card-1', prefix: 'card1_', frames: 20, loop: true, fps: 16 },
      'card-2': { folder: 'assets/character/card-2', prefix: 'card2_', frames: 20, loop: true, fps: 16 },
      'card-3': { folder: 'assets/character/card-3', prefix: 'card3_', frames: 20, loop: true, fps: 16 },
      'card-4': { folder: 'assets/character/card-4', prefix: 'card4_', frames: 20, loop: true, fps: 16 },
      'card-5': { folder: 'assets/character/card-5', prefix: 'card5_', frames: 24, loop: true, fps: 14 }
    },
    cardMap: {
      0: 'card-1',
      1: 'card-2',
      2: 'card-3',
      3: 'card-4',
      4: 'card-5'
    },
    // Anchor del personaggio dentro la PNG di ogni card.
    // x/y sono percentuali del riquadro immagine; y indica la linea dei piedi,
    // tenuta leggermente sopra il bordo inferiore per non uscire dalla grafica.
    cardAnchors: {
      0: { x: 0.50, y: 0.81 },
      1: { x: 0.50, y: 0.81 },
      2: { x: 0.50, y: 0.81 },
      3: { x: 0.45, y: 0.80 },
      4: { x: 0.56, y: 0.80 }
    },
    cardFootRatio: 0.94
  };
})();
