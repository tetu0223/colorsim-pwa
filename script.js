// Simple PWA MobileSAM recolor demo
const COLOR_DB = [
  {code:'ND-010',hex:'#E8E7E2'},
  {code:'ND-012',hex:'#D5D5D2'},
  {code:'ND-372',hex:'#8C8B8C'},
  {code:'ND-108',hex:'#3F3F3E'}
];
const colorSel = document.getElementById('colorSelect');
COLOR_DB.forEach(c=>{const op=document.createElement('option');op.value=c.code;op.text=c.code;colorSel.appendChild(op);});
colorSel.addEventListener('change',()=>{hexInput.value=COLOR_DB.find(c=>c.code===colorSel.value).hex;});
const fileInput=document.getElementById('fileInput');
const canvas=document.getElementById('preview');
const ctx=canvas.getContext('2d');

let ortSession;
async function loadModel(){
  if(ortSession)return;
  document.getElementById('runBtn').textContent='Loading model...'
  ortSession=await ort.InferenceSession.create('https://huggingface.co/ChaoningZhang/MobileSAM/resolve/main/mobile_sam.onnx',{executionProviders:['wasm']});
  document.getElementById('runBtn').textContent='Recolor';
}
loadModel(); // preload

document.getElementById('runBtn').onclick=async()=>{
  if(!fileInput.files[0]){alert('Choose image');return;}
  await loadModel();
  const img=new Image();
  img.src=URL.createObjectURL(fileInput.files[0]);
  img.onload=async()=>{
    canvas.width=img.width;canvas.height=img.height;
    ctx.drawImage(img,0,0);
    // Resize to 256x256 for SAM input
    const resized=document.createElement('canvas');
    resized.width=resized.height=256;
    resized.getContext('2d').drawImage(img,0,0,256,256);
    const input=preprocess(resized);
    const feeds={'image':new ort.Tensor('float32',input,[1,3,256,256])};
    const results=await ortSession.run(feeds);
    const mask=postprocess(results);
    applyColor(mask);
  };
};

function preprocess(cv){
  const d=cv.getContext('2d').getImageData(0,0,256,256).data;
  const f32=new Float32Array(3*256*256);
  for(let i=0;i<256*256;i++){
    f32[i]=d[i*4+2]/255;       // R->B (RGB->BGR)
    f32[i+256*256]=d[i*4+1]/255; // G
    f32[i+2*256*256]=d[i*4]/255; // B->R
  }
  return f32;
}
function postprocess(results){
  const out = results[Object.keys(results)[0]].data;
  // out shape [1,1,256,256]
  return Array.from(out);
}
function applyColor(mask){
  const hex=document.getElementById('hexInput').value;
  const tint=[parseInt(hex.substr(1,2),16),parseInt(hex.substr(3,2),16),parseInt(hex.substr(5,2),16)];
  const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  for(let y=0;y<canvas.height;y++){
    for(let x=0;x<canvas.width;x++){
      const idx=y*canvas.width+x;
      const m=mask[Math.floor(y*256/canvas.height)*256+Math.floor(x*256/canvas.width)];
      if(m>0.5){
        const pIdx=idx*4;
        imgData.data[pIdx]=(imgData.data[pIdx]*0.5 + tint[0]*0.5);
        imgData.data[pIdx+1]=(imgData.data[pIdx+1]*0.5 + tint[1]*0.5);
        imgData.data[pIdx+2]=(imgData.data[pIdx+2]*0.5 + tint[2]*0.5);
      }
    }
  }
  ctx.putImageData(imgData,0,0);
}