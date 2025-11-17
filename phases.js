const phases = [
  { 
    id: 1, 
    startPos: {x:0, y:0},    // ← CUSTOM START!
    endPos: {x:4, y:4},      // ← CUSTOM END!
    coords: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:2,y:1},{x:3,y:1},{x:3,y:2},{x:4,y:2},{x:4,y:3},{x:4,y:4}] 
  },
  { 
    id: 2, 
    startPos: {x:0, y:0},
    endPos: {x:4, y:4},
    coords: [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:0,y:3},{x:1,y:3},{x:2,y:3},{x:2,y:4},{x:3,y:4},{x:4,y:4}] 
  },
  { 
    id: 3, 
    startPos: {x:0, y:0},    // ← START TOP-LEFT
    endPos: {x:4, y:4},      // ← END BOTTOM-RIGHT
    coords: [{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:4},{x:4,y:4}],
    hasFunction: true,
    mainCommandLimit: 4 
  }
  // Phase 4 EXAMPLE (different A/B):
  // { 
  //   id: 4, 
  //   startPos: {x:2, y:2},   // ← START CENTER!
  //   endPos: {x:0, y:4},     // ← END TOP-LEFT!
  //   coords: [...],
  //   hasFunction: true,
  //   mainCommandLimit: 3
  // }
];