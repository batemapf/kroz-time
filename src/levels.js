export const WIDTH = 31, HEIGHT = 19;
export const CHAPTERS = [
  { name: 'The Overgrown Gate', description: 'Every great expedition starts with one questionable step.', hint: 'Find the golden key, then take the stairs deeper.' },
  { name: 'The Hollow Halls', description: 'Something in the dark has learned the sound of your footsteps.', hint: 'Rubble yields to your whip. Keep a charge in reserve.' },
  { name: 'The Violet Crossing', description: 'The old paths are broken. The old magic is not.', hint: 'Violet runes come in pairs. Step on one to cross the chamber.' },
  { name: 'The Sunken Archive', description: 'No one remembers what was buried here. Perhaps that was the point.', hint: 'Traps hurt on every crossing. Look for a safer route.' },
  { name: 'The Crown Below', description: 'One last door. One lost crown. A kingdom holding its breath.', hint: 'Find the final key and claim the crown. You’ve come too far to turn back.' }
];
export function createLevel(index) {
  const grid = Array.from({length: HEIGHT}, (_, y) => Array.from({length: WIDTH}, (_, x) => x===0 || y===0 || x===WIDTH-1 || y===HEIGHT-1 ? '#' : '.'));
  const put = (x,y,c) => grid[y][x]=c;
  const wall = (x,y,w,h) => {for(let a=y;a<y+h;a++)for(let b=x;b<x+w;b++)put(b,a,'#');};
  if(index===0){
    wall(8,1,1,13);put(8,5,'.');put(8,11,'.');wall(17,5,1,13);put(17,9,'.');put(17,15,'.');
    wall(8,8,9,1);put(12,8,'.');wall(22,1,1,9);put(22,4,'.');wall(22,12,8,1);put(26,12,'.');
    for(const [x,y] of [[5,9],[6,9],[5,10],[6,10],[12,13],[13,13],[23,15],[24,15]])put(x,y,':');
  } else if(index===1){
    for(const x of [7,15,23]){wall(x,1,1,17);for(const y of [4,9,15])put(x,y,y===9?':':'.');}
    wall(9,6,4,2);wall(17,11,4,2);wall(25,5,3,2);
  } else if(index===2){
    wall(14,1,3,17);put(15,9,'#');put(3,14,'O');put(27,4,'O');
    wall(4,6,7,1);put(7,6,'.');wall(20,11,7,1);put(23,11,'.');
    put(6,11,'B');put(7,11,'B');put(8,11,'B');
  } else if(index===3){
    for(const y of [5,10,14]){wall(1,y,29,1);for(const x of [4,13,25])put(x,y,'.');}
    for(const [x,y] of [[4,5],[13,10],[25,14],[12,8],[13,8],[14,8],[23,12],[24,12]])put(x,y,'^');
    for(const [x,y] of [[9,3],[18,7],[7,12],[22,16]])put(x,y,'B');
    put(25,10,':');
  } else {
    wall(10,4,11,1);wall(10,14,11,1);wall(10,4,1,11);wall(20,4,1,11);
    put(10,9,':');put(20,9,':');put(15,4,'.');put(15,14,'.');
    for(const [x,y] of [[12,6],[18,6],[12,12],[18,12]])wall(x,y,1,1);
    put(15,8,'^');put(14,9,'^');put(16,9,'^');
  }
  // Explicit placements keep all five chambers reproducible.
  const gems = [[4,3],[5,3],[6,3],[3,7],[11,3],[12,3],[19,3],[25,8],[26,8],[11,16],[12,16],[20,16],[28,14],[5,16],[19,7],[24,16]];
  for(const [x,y] of gems)if(grid[y][x]==='.')put(x,y,'g');
  for(const [x,y] of [[5,12],[19,5],[26,15]])if(grid[y][x]==='.')put(x,y,'w');
  for(const [x,y] of [[11,10],[27,10],[3,16]])if(grid[y][x]==='.')put(x,y,'+');
  const key = index===4?[15,12]:[27,2];put(...key,'k');
  put(...(index===4?[15,9]:[28,16]),index===4?'C':'E');
  put(2,2,'.');
  const positions = [[12,5],[24,9],[6,15],[20,13],[27,6],[11,15],[19,2]].slice(0,3+index);
  const monsters = positions.filter(([x,y])=>grid[y][x]==='.').map(([x,y],id)=>({x,y,id}));
  return { grid, monsters, player:{x:2,y:2}, ...CHAPTERS[index] };
}
