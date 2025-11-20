const phases = [
  {
    id: 1,
    startPos: { x: 0, y: 0 },
    endPos: { x: 5, y: 5 },
    coords: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 2 }, 
      { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }]
  },
  {
    id: 2,
    startPos: { x: 0, y: 0 },
    endPos: { x: 5, y: 5 },
    coords: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },
       { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }]
  },
  {
    id: 3,
    startPos: { x: 0, y: 0 },
    endPos: { x: 5, y: 5 },
    coords: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 },
       { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }],
    hasFunction: true,
    mainCommandLimit: 5,
    functionCommandLimit: 20
  },
  {
    id: 4,
    startPos: { x: 0, y: 5 },
    endPos: { x: 5, y: 0 },
    coords: [
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, 
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 2 }, 
      { x: 4, y: 2}, { x: 4, y: 1 }, { x: 3, y: 1 }, { x:5, y: 1 }, { x: 5, y: 0 },{ x: 4, y: 0 }],
      
    hasFunction: true,
    mainCommandLimit: 10,
    functionCommandLimit: 4
  },
  {
    id: 5,
    startPos: { x: 5, y: 5 },
    endPos: { x: 0, y: 0 },
    coords: [
      { x: 5, y: 5 }, { x: 5, y:4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, 
      { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, 
      { x: 3, y: 3}, { x: 3, y: 4 }, { x: 3, y: 5 }, { x:2, y: 5 }, { x: 1, y: 5 },{ x: 1, y: 4 },
    { x: 1, y: 3}, { x: 1, y: 2 }, { x: 1, y: 1 }, { x:1, y: 0 }, { x: 0, y: 0 }],
      
    hasFunction: true,
    mainCommandLimit: 10,
    functionCommandLimit: 6
  }
];