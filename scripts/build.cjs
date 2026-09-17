const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const terser = require('terser');
const CleanCSS = require('clean-css');
const root = path.resolve(__dirname, '..');
async function walk(dir) {
 for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
  if (entry.name.startsWith('.') || ['node_modules', 'scripts', 'artifacts'].includes(entry.name)) continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()) await walk(file);
  else if(file.endsWith('.js')&&!file.endsWith('.min.js')) {
   const output=await terser.minify(fs.readFileSync(file,'utf8'));
   fs.writeFileSync(file.replace(/\.js$/,'.min.js'),output.code+'\n');
  }
 }
}
(async()=>{
 await walk(root);
 fs.writeFileSync(path.join(root,'style.min.css'),new CleanCSS({level:1}).minify(fs.readFileSync(path.join(root,'style.css'),'utf8')).styles+'\n');
 await sharp(path.join(root,'assets/social-preview.svg')).jpeg({quality:82,mozjpeg:true}).toFile(path.join(root,'assets/social-preview.jpg'));
 await sharp(path.join(root,'assets/favicon.svg')).resize(180,180).png().toFile(path.join(root,'assets/apple-touch-icon.png'));
 const png=await sharp(path.join(root,'assets/favicon.svg')).resize(32,32).png().toBuffer();
 const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
 fs.writeFileSync(path.join(root,'favicon.ico'),Buffer.concat([header,png]));
})();
