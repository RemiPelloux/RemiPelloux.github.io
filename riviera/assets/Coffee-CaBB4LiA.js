import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{C as t,b as n}from"./three-BKSeiHzG.js";/* empty css             */var r=e(t(),1),i=n(),a=[`Grinding beans…`,`Heating water…`,`Brewing…`],o=1400,s=`  _________  
 |         |__
 |         |  |
 |         |__|
  \\_______/   `,c=`  _________  
 |~~~~~~~~~|__
 |#########|  |
 |#########|__|
  \\_______/   `;function l(e){let[t,n]=(0,r.useState)(0);return(0,r.useEffect)(()=>{n(0);let e=a.map((e,t)=>window.setTimeout(()=>n(t+1),o*(t+1)));return()=>e.forEach(e=>window.clearTimeout(e))},[e]),t}function u(e){let[t,n]=(0,r.useState)(0),o=l(t),u=o>=a.length;return(0,i.jsxs)(`div`,{className:`coffee${u?` ready`:``}`,children:[(0,i.jsxs)(`pre`,{className:`cup inset`,"aria-hidden":`true`,children:[(0,i.jsx)(`span`,{className:`steam`,children:`   ) ) )`}),u?c:s]}),(0,i.jsx)(`span`,{className:`brew-bar inset`,role:`progressbar`,"aria-label":`Brewing`,"aria-valuemin":0,"aria-valuemax":a.length,"aria-valuenow":o,children:(0,i.jsx)(`i`,{style:{width:`${o/a.length*100}%`}})}),(0,i.jsx)(`ol`,{className:`brew-steps`,children:a.map((e,t)=>(0,i.jsxs)(`li`,{className:t<o?`done`:t===o?`doing`:void 0,children:[t<o?`[x] `:`[ ] `,e]},e))}),(0,i.jsx)(`p`,{className:`coffee-msg`,role:`status`,children:u?`Your coffee is ready ☕ (virtual, sorry)`:``}),(0,i.jsx)(`button`,{type:`button`,className:`btn`,onClick:()=>n(e=>e+1),children:u?`Brew another`:`Restart`})]})}export{u as default};