import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Try multiple sources for larger ball images
const SOURCES = [
  // Pokemon Showdown item sprites (scalable via CSS)
  'https://raw.githubusercontent.com/msikma/pokesprite/master/items/ball/poke.png',
  'https://raw.githubusercontent.com/msikma/pokesprite/master/items/ball/great.png',
  'https://raw.githubusercontent.com/msikma/pokesprite/master/items/ball/ultra.png',
  'https://raw.githubusercontent.com/msikma/pokesprite/master/items/ball/premier.png',
  'https://raw.githubusercontent.com/msikma/pokesprite/master/items/ball/master.png',
];

const names = ['pokeball', 'greatball', 'ultraball', 'premierball', 'masterball'];
const dir = resolve('data/balls');
mkdirSync(dir, { recursive: true });

for (let i = 0; i < names.length; i++) {
  const url = SOURCES[i];
  const name = names[i];
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed ${name}: ${response.status}`);
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(resolve(dir, `${name}.png`), buffer);
    console.log(`OK ${name}.png (${buffer.length} bytes)`);
  } catch (e) {
    console.error(`Error ${name}: ${e.message}`);
  }
}
console.log('Done');
