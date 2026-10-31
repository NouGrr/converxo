const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',image:'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M3 16l5-5 4 4 4-6 5 7 M8 7h.01',video:'M3 5h12v14H3z M15 10l6-4v12l-6-4',music:'M9 18V5l12-2v13 M9 9l12-2 M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3 M21 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3',file:'M14 2H5v20h14V7z M14 2v5h5 M8 12h8 M8 16h6',shield:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z M8 12l3 3 5-6',help:'M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',upload:'M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6',plus:'M12 5v14 M5 12h14',lock:'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',layers:'M12 3l10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',check:'M5 12l4 4L19 6',download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',refresh:'M20 7V2l-4 4 M20 7a9 9 0 0 0-16 1 M4 17v5l4-4 M4 17a9 9 0 0 0 16-1'};
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
function icon(name){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.file}"/></svg>`}$$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const groups={image:['png','jpg','jpeg','webp','avif','svg','gif','bmp','tif','tiff','ico'],video:['mp4','webm','mov','mkv','avi','m4v','mpg','mpeg','ts','mts','m2ts','ogv','wmv','flv'],audio:['mp3','wav','aac','ogg','m4a','flac','opus','aif','aiff','wma'],document:['pdf','docx','txt','html','htm','md']};
const outputs={image:['png','jpg','webp','svg','gif','bmp','tiff','ico','pdf'],video:['mp4','webm','mov','mkv','avi','m4v','mpeg','ts','ogv'],audio:['mp3','wav','aac','ogg','m4a','flac','opus','aiff','wma'],document:['pdf','docx','txt','html','md','rtf']};
const labels={image:'Images',video:'Vidéos',audio:'Audio',document:'Documents'};const colors={image:'category-image',video:'category-video',audio:'category-audio',document:'category-document'};const icons={image:'image',video:'video',audio:'music',document:'file'};
let files=[],category='all',running=false,activeJob=null,ffmpegPromise,toastTimer;let sequence=0;
const ext=name=>name.split('.').pop().toLowerCase();const kind=file=>Object.keys(groups).find(k=>groups[k].includes(ext(file.name)));const size=n=>n<1024?`${n} o`:n<1048576?`${(n/1024).toFixed(1)} Ko`:`${(n/1048576).toFixed(1)} Mo`;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,6500)}
function setCategory(next){category=next;document.body.dataset.category=next;$$('[data-category]').forEach(b=>b.classList.toggle('active',b.dataset.category===next));$('#file-input').accept=next==='all'?Object.values(groups).flat().map(e=>'.'+e).join(','):groups[next].map(e=>'.'+e).join(',');$('#drop-hint').textContent=`${next==='all'?'Images, vidéos, audio et documents':labels[next]} · 100 Mo par fichier`;render()}
$$('[data-category]').forEach(b=>b.addEventListener('click',()=>{setCategory(b.dataset.category);if(b.classList.contains('format-card'))$('.converter').scrollIntoView({behavior:'smooth',block:'center'})}));
$('#choose').onclick=()=>$('#file-input').click();$('#file-input').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
let dragDepth=0;const drop=$('#dropzone');drop.addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;drop.classList.add('dragover')});drop.addEventListener('dragover',e=>e.preventDefault());drop.addEventListener('dragleave',()=>{if(--dragDepth<=0)drop.classList.remove('dragover')});drop.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;drop.classList.remove('dragover');addFiles([...e.dataTransfer.files])});document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>e.preventDefault());
function addFiles(incoming){if(running)return toast('Patientez jusqu’à la fin du lot avant d’ajouter des fichiers.');const rejected=[];for(const file of incoming){const type=kind(file);if(!type){rejected.push(`${file.name} : format non pris en charge`);continue}if(file.size>100*1024*1024){rejected.push(`${file.name} : limite de 100 Mo dépassée`);continue}if(files.length>=20){rejected.push('20 fichiers maximum par lot');break}if(category!=='all'&&type!==category){rejected.push(`${file.name} : choisissez la catégorie « Tous les fichiers »`);continue}files.push({id:++sequence,file,type,target:outputs[type].find(x=>x!==ext(file.name))||outputs[type][0],state:'ready',progress:0})}if(rejected.length)toast(rejected.join(' · '));render()}
function release(item){if(item.url)URL.revokeObjectURL(item.url)}
function render(){const shown=category==='all'?files:files.filter(f=>f.type===category);$('#queue').hidden=files.length===0;$('.converter').classList.toggle('busy',files.length>0);$('#file-count').textContent=shown.length;$('#file-list').replaceChildren();for(const item of shown){const row=document.createElement('div');row.className='file-row';row.innerHTML=`<span class="category-icon ${colors[item.type]}">${icon(icons[item.type])}</span><div class="file-details"><div class="file-name"></div><div class="file-meta"></div></div><span class="arrow">→</span><select aria-label="Format de sortie"></select><button class="icon-button" aria-label="Retirer le fichier">×</button>`;row.querySelector('.file-name').textContent=item.file.name;row.querySelector('.file-name').title=item.file.name;const meta=row.querySelector('.file-meta');meta.textContent=`${size(item.file.size)} · ${item.state==='ready'?'Prêt à convertir':item.state==='working'?(item.message||'Conversion en cours…'):item.state==='done'?`Terminé · ${size(item.result.size)}`:item.error}`;if(item.state==='error')meta.classList.add('error-text');if(item.state==='done'){meta.classList.add('success-text');const a=document.createElement('a');a.className='download-link';a.href=item.url;a.download=item.filename;a.textContent='Télécharger ↓';row.querySelector('.file-details').append(a)}if(item.state==='working'){const track=document.createElement('div');track.className='progress-track';const bar=document.createElement('span');bar.style.width=`${Math.max(4,item.progress)}%`;track.append(bar);row.querySelector('.file-details').append(track)}const select=row.querySelector('select');for(const format of outputs[item.type]){const opt=new Option(format.toUpperCase(),format);select.add(opt)}select.value=item.target;select.disabled=running;select.setAttribute('aria-label',`Format de sortie de ${item.file.name}`);select.onchange=()=>{release(item);item.target=select.value;item.state='ready';item.result=null;item.url=null;render()};const remove=row.querySelector('button');remove.disabled=running;remove.onclick=()=>{release(item);files=files.filter(f=>f.id!==item.id);render()};$('#file-list').append(row)}const done=files.filter(f=>f.state==='done');$('#queue-summary').textContent=running?'Conversion locale en cours. Gardez cet onglet ouvert.':`${files.length} fichier${files.length>1?'s':''} · ${done.length} converti${done.length>1?'s':''}${!shown.length?' · Aucun fichier dans cette catégorie.':''}`;$('#download-all').hidden=!done.length;$('#download-all').disabled=running;$('#convert').disabled=running||!files.some(f=>f.state==='ready'||f.state==='error');$('#convert').innerHTML=icon('refresh')+(running?'Conversion en cours…':'Tout convertir');$('#clear').disabled=running;$('#choose').disabled=running}
$('#clear').onclick=()=>{files.forEach(release);files=[];render()};
$('#convert').onclick=async()=>{if(running)return;running=true;render();try{for(const item of files.filter(x=>x.state==='ready'||x.state==='error')){activeJob=item;item.state='working';item.progress=0;item.message='Préparation…';render();await new Promise(r=>setTimeout(r,30));try{item.result=await convert(item);if(!item.result.size)throw new Error('Le résultat est vide.');item.filename=`${item.file.name.replace(/\.[^.]+$/,'')}-converxo.${item.target}`;item.url=URL.createObjectURL(item.result);item.state='done';item.message='';}catch(error){console.error(error);item.state='error';item.error=error.message||'Conversion impossible pour ce fichier.'}render()}}finally{activeJob=null;running=false;render();const errors=files.filter(f=>f.state==='error').length;toast(errors?`Lot terminé avec ${errors} erreur${errors>1?'s':''}. Consultez les fichiers concernés.`:'Vos fichiers sont prêts à être téléchargés.')}};
function status(message,progress){if(activeJob){activeJob.message=message;if(progress!==undefined)activeJob.progress=progress;render()}}
const scripts=new Map();function loadScript(url,test){if(test())return Promise.resolve();if(scripts.has(url))return scripts.get(url);const promise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=()=>resolve();s.onerror=()=>{scripts.delete(url);s.remove();reject(new Error('Moteur indisponible. Vérifiez votre connexion puis réessayez.'))};document.head.append(s)});scripts.set(url,promise);return promise}
async function blobURL(url,mime){const res=await fetch(url);if(!res.ok)throw new Error('Téléchargement du moteur impossible. Réessayez.');return URL.createObjectURL(new Blob([await res.arrayBuffer()],{type:mime}))}
async function getFFmpeg(){if(!ffmpegPromise)ffmpegPromise=(async()=>{status('Chargement du moteur de conversion (~32 Mo)…',3);const {FFmpeg}=await import('./vendor/ffmpeg/index.js');const ff=new FFmpeg();ff.on('progress',({progress})=>status('Conversion en cours…',Math.min(96,Math.max(5,Math.round(progress*100)))));let coreURL,wasmURL;try{[coreURL,wasmURL]=await Promise.all([blobURL('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js','text/javascript'),blobURL('https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm','application/wasm')]);await ff.load({coreURL,wasmURL});return ff}catch(e){ff.terminate();throw e}finally{if(coreURL)URL.revokeObjectURL(coreURL);if(wasmURL)URL.revokeObjectURL(wasmURL)}})().catch(e=>{ffmpegPromise=null;throw e});return ffmpegPromise}
async function convert(item){if(item.type==='image')return imageConvert(item);if(item.type==='document')return documentConvert(item);return mediaConvert(item)}
const outputMimes={png:'image/png',jpg:'image/jpeg',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',tiff:'image/tiff',ico:'image/vnd.microsoft.icon',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',mkv:'video/x-matroska',avi:'video/x-msvideo',m4v:'video/mp4',mpeg:'video/mpeg',ts:'video/mp2t',ogv:'video/ogg',mp3:'audio/mpeg',wav:'audio/wav',aac:'audio/aac',ogg:'audio/ogg',m4a:'audio/mp4',flac:'audio/flac',opus:'audio/ogg; codecs=opus',aiff:'audio/aiff',wma:'audio/x-ms-wma'};
const audioArgs={
  mp3:['-vn','-c:a','libmp3lame','-b:a','192k'],
  wav:['-vn','-c:a','pcm_s16le'],
  aac:['-vn','-c:a','aac','-b:a','192k'],
  ogg:['-vn','-c:a','libvorbis','-q:a','5'],
  m4a:['-vn','-c:a','aac','-b:a','192k','-f','ipod'],
  flac:['-vn','-c:a','flac'],
  opus:['-vn','-c:a','libopus','-b:a','128k'],
  aiff:['-vn','-c:a','pcm_s16be'],
  wma:['-vn','-ar','44100','-c:a','wmav2','-b:a','128k']
};
const h264Args=['-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-c:a','aac'];
const videoArgs={
  mp4:[...h264Args,'-movflags','+faststart'],
  mov:[...h264Args,'-movflags','+faststart'],
  m4v:[...h264Args,'-movflags','+faststart','-f','mp4'],
  mkv:h264Args,
  webm:['-c:v','libvpx','-b:v','1200k','-c:a','libopus'],
  avi:['-c:v','mpeg4','-q:v','5','-c:a','libmp3lame'],
  mpeg:['-c:v','mpeg2video','-q:v','5','-pix_fmt','yuv420p','-r','25','-c:a','mp2','-b:a','192k','-ar','44100'],
  ts:[...h264Args,'-f','mpegts'],
  ogv:['-c:v','libtheora','-q:v','6','-pix_fmt','yuv420p','-c:a','libvorbis','-q:a','4']
};
const imageArgs={
  png:['-c:v','png'],gif:['-c:v','gif'],bmp:['-c:v','bmp'],tiff:['-c:v','tiff'],
  ico:['-vf','scale=256:256:force_original_aspect_ratio=decrease,pad=256:256:(ow-iw)/2:(oh-ih)/2:color=0x00000000','-c:v','bmp','-pix_fmt','bgra']
};
async function ffmpegConvert(item,args){
  const ff=await getFFmpeg();
  const input=`input-${item.id}.${ext(item.file.name)}`,output=`output-${item.id}.${item.target}`;
  try{
    await ff.writeFile(input,new Uint8Array(await item.file.arrayBuffer()));
    status('Conversion en cours…',5);
    const code=await ff.exec(['-i',input,...args,'-y',output],300000);
    if(code!==0)throw new Error('Fichier ou codec non pris en charge, ou limite de conversion atteinte (5 minutes).');
    return new Blob([await ff.readFile(output)],{type:outputMimes[item.target]});
  }finally{
    await ff.deleteFile(input).catch(()=>{});
    await ff.deleteFile(output).catch(()=>{});
  }
}
async function imageConvert(item){
  const {file,target}=item;
  status('Lecture de l’image…',15);
  const source=['tif','tiff','ico'].includes(ext(file.name))
    ?await ffmpegConvert({...item,target:'png'},['-frames:v','1',...imageArgs.png]):file;
  const url=URL.createObjectURL(source);
  try{
    const image=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Image illisible ou format non décodable dans ce navigateur.'));el.src=url});
    if(image.naturalWidth*image.naturalHeight>40000000)throw new Error('Image trop grande : maximum 40 mégapixels.');
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');
    if(target==='jpg'||target==='pdf'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height)}
    ctx.drawImage(image,0,0);
    if(['gif','bmp','tiff','ico'].includes(target)){
      const png=await new Promise(r=>canvas.toBlob(r,'image/png'));
      if(!png)throw new Error('Impossible de préparer cette image.');
      return ffmpegConvert({...item,file:new File([png],'source.png',{type:'image/png'})},['-frames:v','1',...imageArgs[target]]);
    }
    if(target==='pdf'){
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf);
      const pdf=new window.jspdf.jsPDF({orientation:canvas.width>canvas.height?'landscape':'portrait'});
      const w=pdf.internal.pageSize.getWidth(),h=pdf.internal.pageSize.getHeight();
      const ratio=Math.min((w-20)/canvas.width,(h-20)/canvas.height);
      const iw=canvas.width*ratio,ih=canvas.height*ratio;
      pdf.addImage(canvas.toDataURL('image/jpeg',.95),'JPEG',(w-iw)/2,(h-ih)/2,iw,ih);
      return pdf.output('blob');
    }
    if(target==='svg')return new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image width="100%" height="100%" href="${canvas.toDataURL('image/png')}"/></svg>`],{type:'image/svg+xml'});
    const mime=outputMimes[target];
    const blob=await new Promise(r=>canvas.toBlob(r,mime,.92));
    if(!blob||blob.type!==mime)throw new Error('Ce navigateur ne permet pas cet encodage. Essayez PNG ou JPG.');
    return blob;
  }finally{URL.revokeObjectURL(url)}
}
async function mediaConvert(item){
  const args=item.type==='video'
    ?['-map','0:v:0','-map','0:a:0?','-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2',...videoArgs[item.target]]
    :audioArgs[item.target];
  return ffmpegConvert(item,args);
}
function toRTF(text){
  const escaped=text.replace(/\r\n?/g,'\n').split('').map(char=>{
    if(char==='\n')return '\\par\n';
    if(char==='\t')return '\\tab ';
    if('\\{}'.includes(char))return '\\'+char;
    const code=char.charCodeAt(0);
    return code>127?'\\u'+(code>32767?code-65536:code)+'?':code<32?'':char;
  }).join('');
  return '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\uc1\\f0\\fs22 '+escaped+'}';
}
const escapeHTML=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function extractText(file){const extension=ext(file.name);if(extension==='docx'){await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.9.1/mammoth.browser.min.js',()=>!!window.mammoth);return (await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value}if(extension==='pdf'){await loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',()=>!!window.pdfjsLib);window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';const pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;try{const pages=[];if(pdf.numPages>500)throw new Error('PDF trop long : maximum 500 pages.');for(let n=1;n<=pdf.numPages;n++){status(`Lecture du PDF : page ${n}/${pdf.numPages}…`,Math.round(n/pdf.numPages*65));const content=await(await pdf.getPage(n)).getTextContent();pages.push(content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join(''))}const result=pages.join('\n\n');if(!result.trim())throw new Error('Ce PDF ne contient pas de texte extractible. Les scans ne sont pas pris en charge.');return result}finally{await pdf.destroy()}}const text=await file.text();if(extension==='html'||extension==='htm'){const parsed=new DOMParser().parseFromString(text,'text/html');parsed.querySelectorAll('script,style,iframe,object').forEach(el=>el.remove());return (parsed.body.textContent||'').trim()}return text}
async function documentConvert({file,target}){status('Lecture du contenu textuel…',10);const text=await extractText(file);if(target==='txt'||target==='md')return new Blob([text],{type:target==='md'?'text/markdown;charset=utf-8':'text/plain;charset=utf-8'});if(target==='rtf')return new Blob([toRTF(text)],{type:'application/rtf'});if(target==='html')return new Blob([`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(file.name)}</title></head><body><main style="max-width:800px;margin:40px auto;font:16px/1.7 system-ui;white-space:pre-wrap">${escapeHTML(text)}</main></body></html>`],{type:'text/html;charset=utf-8'});status('Création du document…',70);if(target==='pdf'){await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',()=>!!window.jspdf);const pdf=new window.jspdf.jsPDF();pdf.setFont('helvetica');pdf.setFontSize(11);const lines=pdf.splitTextToSize(text,175);let y=20;for(const line of lines){if(y>277){pdf.addPage();y=20}pdf.text(line,18,y);y+=5.5}return pdf.output('blob')}const {Document,Packer,Paragraph,TextRun}=await import('https://esm.sh/docx@9.5.1');return Packer.toBlob(new Document({sections:[{children:text.split(/\r?\n/).map(line=>new Paragraph({children:[new TextRun(line)]}))}]}))}
$('#download-all').onclick=async()=>{const button=$('#download-all');button.disabled=true;try{await loadScript('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js',()=>!!window.fflate);const used=new Set(),entries={};for(const item of files.filter(x=>x.state==='done')){let name=item.filename;let n=2;while(used.has(name))name=item.filename.replace(/(\.[^.]+)$/,`-${n++}$1`);used.add(name);entries[name]=new Uint8Array(await item.result.arrayBuffer())}const data=await new Promise((resolve,reject)=>window.fflate.zip(entries,{level:0},(err,data)=>err?reject(err):resolve(data)));const url=URL.createObjectURL(new Blob([data],{type:'application/zip'}));const a=document.createElement('a');a.href=url;a.download='converxo-fichiers.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){toast(e.message)}finally{button.disabled=false}};
for(const id of ['help-open','about-open'])$('#'+id).onclick=()=>$('#help-dialog').showModal();$('#help-close').onclick=()=>$('#help-dialog').close();$('#help-dialog').onclick=e=>{if(e.target===$('#help-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}};
for(const card of $$('.format-card')){const tags=card.querySelector('.format-tags');tags.replaceChildren(...outputs[card.dataset.category].map(format=>{const tag=document.createElement('span');tag.textContent=format==='webp'?'WebP':format.toUpperCase();return tag}))}
window.addEventListener('beforeunload',e=>{if(running){e.preventDefault();e.returnValue=''}});setCategory('all');
