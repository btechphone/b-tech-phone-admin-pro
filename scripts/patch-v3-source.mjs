import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(), source=path.join(root,'overrides')
function copy(dir){for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);const rel=path.relative(source,full);const dest=path.join(root,rel);if(fs.statSync(full).isDirectory()){fs.mkdirSync(dest,{recursive:true});copy(full)}else{fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(full,dest)}}}
if(fs.existsSync(source))copy(source)
console.log('[patch-v3] applied source overrides')
