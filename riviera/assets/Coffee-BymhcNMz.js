import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{C as t,b as n}from"./three-BKSeiHzG.js";/* empty css             */var r=e(t(),1),i=n(),a=[`Grinding beans…`,`Heating water…`,`Brewing…`],o=1400,s=`  _________  
 |         |__
 |         |  |
 |         |__|
  \\_______/   `,c=`  _________  
 |~~~~~~~~~|__
 |#########|  |
 |#########|__|
  \\_______/   `;function l(e){let[t,n]=(0,r.useState)(0);return(0,r.useEffect)(()=>{n(0);let e=a.map((e,t)=>window.setTimeout(()=>n(t+1),o*(t+1)));return()=>e.forEach(e=>window.clearTimeout(e))},[e]),t}function u({step:e}){return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(`span`,{className:`brew-bar inset`,role:`progressbar`,"aria-label":`Brewing`,"aria-valuemin":0,"aria-valuemax":a.length,"aria-valuenow":e,children:(0,i.jsx)(`i`,{style:{width:`${e/a.length*100}%`}})}),(0,i.jsx)(`ol`,{className:`brew-steps`,children:a.map((t,n)=>(0,i.jsxs)(`li`,{className:n<e?`done`:n===e?`doing`:void 0,children:[n<e?`[x] `:`[ ] `,t]},t))})]})}function d(e){let[t,n]=(0,r.useState)(0),o=l(t),d=o>=a.length;return(0,i.jsxs)(`div`,{className:`coffee${d?` ready`:``}`,children:[(0,i.jsxs)(`pre`,{className:`cup inset`,"aria-hidden":`true`,children:[(0,i.jsx)(`span`,{className:`steam`,children:`   ) ) )`}),d?c:s]}),(0,i.jsx)(u,{step:o}),(0,i.jsx)(`p`,{className:`coffee-msg`,role:`status`,children:d?`Your coffee is ready ☕ (virtual, sorry)`:``}),(0,i.jsx)(`button`,{type:`button`,className:`btn`,onClick:()=>n(e=>e+1),children:d?`Brew another`:`Restart`})]})}export{d as default};