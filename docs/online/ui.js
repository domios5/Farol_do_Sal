// Interface do Farol de Sal. Não decide nada: pede cada ação ao servidor e mostra o estado que ele devolve.
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
import * as R from './regras.js';
const {SUC_MS,SAL_MS,BIL_MS,ZONAS,EDIF,RAR,MULT,NOMES,SUF,SLOT,ATR,ROT,RAR_NV,NV_MAX,CLASSES,ESQ_MAX,ESQ_SNIPER,PROVAS,proxProva,titulo,poder,grau,LOJA_MS,SIMULADOS,
  esc,lim,prom,maxHp,atk,tipo,armF,armM,duplo,roubo,refl,bXp,bSal,combate,crit,esq,maxEn,enSeg,enMs,custoAtr,xpNec,custo,custoEd,podeSubir,tempoObra,fmtT,
  limpar,descItem,custoRenovar,EXP,ganhoExp,custoAtrN,eqSoma,nomeItem,descBonus,custoUp,custoTroca,chanceUp,PETS,custoPet,bossN,EN_ZONA,valSuc}=R;
let horas=8, rarSel=0, aberto=null, auto=null, autoMsg='', autoEspera=0, S=null, tab='explorar', confirmar=false, aviso='', reais=[], ocupado=false, desvio=0;
const nuvem='ligado', $=id=>document.getElementById(id);
const agora=()=>Date.now()+desvio;   // relógio do servidor
R.relogio(agora);
const sb=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

const ONDA='<path class="agua" d="M2 45q5-4 10 0t10 0 10 0 10 0 10 0 10 0"/>';
const ARTE={
 cais:'<path d="M4 28h56M8 22h48v6H8zM12 28v14M26 28v14M40 28v14M54 28v14M46 22V10l8 4-8 4"/>'+ONDA,
 salinas:'<path d="M6 38l10-16 10 16zM28 38l8-12 8 12zM46 38l6-9 6 9zM2 38h60M11 30l5 3M33 31l4 3M8 44h18M34 44h24"/>',
 traineiras:'<path d="M6 28h52l-8 12H14zM30 28V8M30 10l16 14H30M30 12L18 24h12M14 33h36"/>'+ONDA,
 conserveira:'<path d="M6 42V24l12 6v-6l12 6v-6l12 6V10h8v32zM14 42v-6h6v6M28 36h8M46 6q3-3 7-3M4 42h56"/>',
 plataforma:'<path d="M10 22h44v6H10zM16 28l-4 14M48 28l4 14M24 28v14M40 28v14M30 22V6h4v16M34 8l14 8M14 22v-8h8v8M16 34h32"/>'+ONDA,
 serpente:'<path d="M4 42q6-20 14 0M22 42q6-20 14 0M40 42q2-26 14-28 7 0 6 7-5 3-10 0M54 18v.5M50 21l-3 5"/>'+ONDA,
 lanterna:'<path d="M24 16h16l4 22H20zM28 16v-6h8v6M26 38v4h12v-4M32 22v10M12 26h4M48 26h4"/>',
 farol:'<path d="M26 44l3-26h6l3 26zM27 18h10v-6H27zM30 12l2-6 2 6M20 44h24M28 28h8M27 36h10M38 13l13-4M38 16l13 4M26 13L13 9M26 16l-13 4"/>',
 destilaria:'<path d="M24 10h16M28 10v10L16 42h32L36 20V10M22 32h20M40 14h10v10M50 24l-3 6h6z"/>',
 oficina:'<path d="M10 16h36q6 0 10 5H40q-2 9-6 9v6h8v6H18v-6h8v-6q-10 0-12-9z"/>',
 sucateira:'<path d="M8 42h48M16 42V12h6v30M22 14h28M22 22l12-8M46 14v10M41 24h10l-2 9h-6z"/>',
 arma:'<path d="M10 40L46 8M46 8l8-2-2 8zM40 8l10 10M14 44l-6-6"/>',
 armadura:'<path d="M20 8l12 4 12-4 8 8-6 6v20H18V22l-6-6zM32 12v30"/>',
 colar:'<path d="M20 6q12 14 24 0M32 16v6M24 30a8 8 0 1 0 16 0 8 8 0 1 0-16 0M32 26v8M28 30h8"/>',
 capacete:'<path d="M14 34q0-22 18-22t18 22zM10 34h44v6H10zM32 12V7"/>',
 luvas:'<path d="M22 44V26l-7-8 4-3 7 6V10h5v10V7h5v13V10h5v12l4-4 4 3-8 12v11zM22 38h18"/>',
 botas:'<path d="M22 6h14v24l14 6v8H22zM22 36h28M22 12h14"/>',
 calcas:'<path d="M18 6h28l4 38H38l-6-24-6 24H14zM18 12h28"/>',
 anel:'<path d="M22 32a10 10 0 1 0 20 0 10 10 0 1 0-20 0M27 20l5-12 5 12z"/>',
 escudo:'<path d="M32 6l16 6v12q0 14-16 20-16-6-16-20V12zM32 14v22M24 22h16"/>',
 mago:'<path d="M20 44L40 12M40 12l4-7 2 7 7 2-6 4zM14 18l2 4 4 2-4 2-2 4-2-4-4-2 4-2z"/>',
 sniper:'<path d="M8 40l40-28M48 12l8-4-4 8zM20 16q16 4 22 22M20 16l22 22M12 44l-6-6"/>',
 recife:'<path d="M10 42l6-20 6 20zM24 42l8-30 8 30zM42 42l5-16 5 16zM4 42h56M30 26l4 4M14 32l3 3"/>',
 cidade:'<path d="M8 42V22h10v20M22 42V12h10v30M36 42V26h8v16M48 42V18h8v24M12 28h2M26 18h2M26 26h2M51 24h2M51 32h2"/>'+ONDA,
 sinos:'<path d="M22 34q0-20 10-20t10 20zM18 34h28M32 14V8M30 38a2 2 0 1 0 4 0"/>'+ONDA,
 sargaco:'<path d="M12 44q-6-12 0-20t0-16M26 44q6-10 0-18t2-14M40 44q-6-12 0-22t0-12M52 44q5-9 0-16t2-12"/>',
 boca:'<path d="M6 12q26 14 52 0M6 40q26-14 52 0M12 15l3 8 4-6 4 8 4-7 5 8 5-8 4 7 4-8 4 6 3-8M14 37l4-6 5 5 5-6 4 6 4-6 5 6 5-5 4 6"/>',
 pet_xp:'<path d="M22 18q0-10 10-10t10 10v14q0 10-10 10T22 32zM22 12l-3-6 7 3M42 12l3-6-7 3M24 20a3 3 0 1 0 6 0 3 3 0 1 0-6 0M34 20a3 3 0 1 0 6 0 3 3 0 1 0-6 0M32 24l-2 4h4zM26 35q6 4 12 0"/>',
 pet_sal:'<path d="M20 28q0-8 12-8t12 8-12 8-12-8zM20 26l-8-6M12 20q-4-6 2-8M12 20q-6 0-6-6M44 26l8-6M52 20q4-6-2-8M52 20q6 0 6-6M22 34l-6 6M28 36l-3 6M36 36l3 6M42 34l6 6M28 22v-4M36 22v-4"/>',
 pet_vida:'<path d="M14 32q0-16 18-16t18 16zM50 30q8-4 10 2-4 4-10 0M18 32v6h6v-6M40 32v6h6v-6M14 30l-6 3M24 18l4 14M40 18l-4 14M17 26h30"/>',
 pet_dano:'<path d="M10 38q8-14 24-12 8-8 14-2 2 6-6 8-2 8-14 8zM10 38q-6 0-6-6M44 25v.5M30 14l22-8M52 6l5-2-2 5z"/>',
 pet_roubo:'<path d="M6 38q10-20 20-8t20-10M46 20q8-6 10 2t-8 6q-6-2-2-8M50 24v2M14 33v.5M20 29v.5M26 31v.5"/>',
 pet_duplo:'<path d="M6 20q8-10 14 0 6-10 14 0M30 36q8-10 14 0 6-10 14 0M20 20l-2 5M44 36l-2 5"/>',
 pet_refl:'<path d="M12 38q0-18 20-18t20 18zM16 26l-5-8M22 22l-3-10M30 20l-1-11M38 21l3-10M44 24l6-8M49 30l8-4M20 34v.5M10 38h44"/>',
 incubadora:'<path d="M32 8q-12 0-12 18a12 12 0 0 0 24 0q0-18-12-18zM14 40q18 8 36 0M10 36l6 6M54 36l-6 6M26 22l4 4 4-4 4 4"/>',
 exped:'<path d="M8 30h48l-8 12H16zM32 30V6M32 8l16 18H32M32 12L20 26h12"/>'+ONDA,
 loja:'<path d="M8 20l6-12h36l6 12zM8 20q4 6 8 0 4 6 8 0 4 6 8 0 4 6 8 0 4 6 8 0 4 6 8 0M12 24v18h40V24M26 42V30h12v12"/>'
};
const arte=(k,w)=>`<svg class="arte" viewBox="0 0 64 48" width="${w}" aria-hidden="true">${ARTE[k]}</svg>`;
function topo(){
  const g=id=>document.getElementById(id), mh=maxHp(), me=maxEn(), xn=xpNec();
  g('hSal').textContent=S.sal; g('hSuc').textContent=S.suc; g('hNv').textContent=S.nv;
  let e=S.en+'/'+me; if(S.en<me)e+=' · '+Math.ceil((enMs()-(agora()-S.tE))/1000)+'s';
  g('hEn').textContent=e; g('bEn').style.width=100*S.en/me+'%';
  g('hXp').textContent=S.xp+'/'+xn; g('bXp').style.width=100*S.xp/xn+'%';
}
function vLoja(){
  const min=Math.max(1,Math.ceil((LOJA_MS-(agora()-S.loja.t))/60000));
  return `<h2>Loja do Cais</h2><p class="lenda">O mercador troca de mercadoria a cada meia hora. Para vender, usa a mochila no separador Herói.</p><div class="lista">`+
  (S.loja.it.length?S.loja.it.map(i=>`<div class="cartao">${arte(i.slot,40)}<div><h3 class="r${i.r}">${nomeItem(i)}</h3><p class="nota num">${SLOT[i.slot]} · ${RAR[i.r]} · Nv ${i.nv}</p><p class="nota num">${descItem(i)}${descBonus(i)}</p></div>
  <button class="btn" data-act="comprar" data-i="${i.id}" ${S.sal>=i.preco&&S.inv.length<20?'':'disabled'}><span class="num">${i.preco}</span> sal</button></div>`).join(''):'<p class="lenda">Compraste tudo. O mercador agradece.</p>')+
  `</div><p class="nota">Mercadoria nova em <span class="num">${min}</span> min.${S.inv.length>=20?' A mochila está cheia.':''}</p>
  <div class="solta"><button class="btn sec peq" data-act="renovar" ${S.sal>=custoRenovar()?'':'disabled'}>Trocar já por <span class="num">${custoRenovar()}</span> sal</button></div>`;
}
function vClasse(){
  return `<h2>Escolhe o teu ofício</h2><p class="lenda">Cada faroleiro defende a luz à sua maneira. A escolha fica até recomeçares do zero.</p><div class="lista">`+
  Object.keys(CLASSES).map(k=>{const C=CLASSES[k];return `<div class="cartao">${arte(k,52)}<div><h3>${C.n}</h3><p class="nota">${C.d}</p><p class="lenda">No nível 20, ${C.p}: ${C.u}</p><p class="lenda">No nível 60, ${C.p2}: ${C.u2}</p></div><button class="btn" data-act="classe" data-i="${k}">Escolher</button></div>`}).join('')+`</div>`;
}
let fila=[],relogio=null,lA,lB;
function linha(){
  const l=fila.shift(), reg=document.getElementById('reg'); if(!l)return fimLuta();
  const p=document.createElement('p');p.className=l.c;p.textContent=l.m;reg.appendChild(p);reg.scrollTop=reg.scrollHeight;
  if(l.a!==undefined){document.getElementById('lB1').style.width=100*l.a/lA.max+'%';document.getElementById('lB2').style.width=100*l.b/lB.max+'%'}
  if(!fila.length)fimLuta();
}
function fimLuta(){clearInterval(relogio);relogio=null;document.getElementById('lFim').textContent='Continuar'}
function mostrarLuta(a,b,linhas,img){
  lA=a;lB=b;fila=linhas.slice();
  document.getElementById('lN1').textContent=a.n;document.getElementById('lN2').textContent=b.n;
  document.getElementById('lB1').style.width='100%';document.getElementById('lB2').style.width='100%';
  document.getElementById('lArte').innerHTML=arte(img,120);
  document.getElementById('reg').innerHTML='';document.getElementById('lFim').textContent='Saltar';
  document.getElementById('luta').hidden=false;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){while(fila.length)linha()}
  else relogio=setInterval(linha,260);
  document.getElementById('lFim').focus();
}
document.getElementById('lFim').onclick=()=>{
  if(relogio||fila.length){clearInterval(relogio);relogio=null;while(fila.length)linha();return}
  document.getElementById('luta').hidden=true;desenhar();
};
const resumo=l=>{const o=l.filter(x=>x.c==='p').length;return 'Última ronda: '+l.filter((x,j)=>j<2||x.c==='f'||x.c==='e').map(x=>x.m).join(' ')+(o?` ${o} ${o===1?'objeto novo':'objetos novos'}.`:'')};
function vLimpa(){
  const al=S.inv.filter(i=>i.r<=rarSel&&!(i.up>0)), gs=al.reduce((t,i)=>t+i.val,0), gc=al.reduce((t,i)=>t+valSuc(i),0), m=S.lixo;
  return `<div class="forja"><b>Limpar por raridade</b><div class="solta"><label for="rarAte" class="nota">Tudo até</label><select id="rarAte">${RAR.map((n,r)=>`<option value="${r}"${r===rarSel?' selected':''}>${n}</option>`).join('')}</select>
  <button class="btn peq" data-act="limpar" data-i="vender:${rarSel}" ${al.length?'':'disabled'}>Vender ${al.length} · +<span class="num">${gs}</span> sal</button><button class="btn peq" data-act="limpar" data-i="desmontar:${rarSel}" ${al.length?'':'disabled'}>Desmontar ${al.length} · +<span class="num">${gc}</span> sucata</button></div>
  <p class="nota">${m&&m.ate>=0?`Automático ligado: ${m.modo==='desmontar'?'desmontas':'vendes'} sozinho o que apanhares até ${RAR[m.ate]}.`:'Automático desligado: tudo o que apanhas vai para a mochila.'} O equipado e os objetos já forjados nunca entram na limpeza.</p>
  <div class="solta"><button class="btn sec peq" data-act="lixo" data-i="vender:${rarSel}">Vender ao apanhar</button><button class="btn sec peq" data-act="lixo" data-i="desmontar:${rarSel}">Desmontar ao apanhar</button>${m&&m.ate>=0?`<button class="btn sec peq" data-act="lixo" data-i="vender:-1">Desligar</button>`:''}</div></div>`;
}
function forja(i){
  if(aberto!=i.id)return '';
  const u=custoUp(i), t=custoTroca(i), up=i.up||0;
  return `<div class="forja"><b>Forja: ${nomeItem(i)}</b><div class="solta"><button class="btn peq" data-act="melhorar" data-i="${i.id}" ${up<10&&S.sal>=u.sal&&S.suc>=u.suc?'':'disabled'}>${up>=10?'Já está em +10':`Melhorar para +${up+1} · ${chanceUp(i)}% de chance · <span class="num">${u.sal}</span> sal, <span class="num">${u.suc}</span> sucata`}</button><button class="btn peq" data-act="trocar" data-i="${i.id}" ${S.sal>=t.sal&&S.suc>=t.suc?'':'disabled'}>Trocar bónus · <span class="num">${t.sal}</span> sal, <span class="num">${t.suc}</span> sucata</button></div><p class="nota">Cada melhoria dá +8% aos valores base, até +10. Se a forja falhar, o objeto fica igual, pagas na mesma e a chance seguinte sobe 10%. Trocar sorteia bónus novos e os atuais perdem-se.</p></div>`;
}
const fmtN=x=>String(x).replace('.',',');
function vPets(){
  const n=S.ed.incubadora;
  if(!n)return `<h2>Mascotes</h2><p class="lenda">Constrói a Incubadora, a partir do nível 10, para chocares a tua primeira mascote.</p>`;
  return `<h2>Mascotes</h2><p class="lenda">Só uma mascote te acompanha de cada vez, e a Incubadora choca uma de cada vez. Neste momento chega à versão ${n}.</p><div class="lista">`+
  Object.keys(PETS).map(k=>{const P=PETS[k],t=S.pets[k]||0,c=custoPet(t+1),aqui=S.choco&&S.choco.k===k,pode=!S.choco&&t<n&&S.sal>=c.sal&&S.suc>=c.suc;
  return `<div class="cartao">${arte(t?'pet_'+k:'incubadora',44)}<div><h3>${P[0]} <span class="num nota">${t?'versão '+t:'por chocar'}</span>${S.pet===k?' <span class="selo">contigo</span>':''}</h3><p class="nota num">${t?'Agora: +'+fmtN(P[2]*t)+P[1]:'Dá'+P[1].replace('%','')}${t<10?' · versão '+(t+1)+': +'+fmtN(P[2]*(t+1))+P[1]:''}</p>${t<n&&!aqui?`<p class="nota num">Incubação: ${fmtT(c.ms)}</p>`:''}</div>
  <div class="acoes">${t&&S.pet!==k?`<button class="btn sec peq" data-act="pet" data-i="${k}">Levar</button>`:''}<button class="btn peq" data-act="chocar" data-i="${k}" ${pode?'':'disabled'}>${aqui?`A chocar<br><span class="num">${fmtT(S.choco.fim-agora())}</span>`:t>=10?'Versão máxima':t>=n?'Sobe a Incubadora':`${t?'Evoluir':'Chocar'}<br><span class="num">${c.sal}</span> sal, <span class="num">${c.suc}</span> sucata`}</button></div></div>`}).join('')+`</div>`;
}
function vExped(){
  if(S.exp){const e=S.exp;return `<div class="cartao">${arte('exped',56)}<div><h3>Em expedição</h3><p class="lenda">À procura de ${EXP[e.tipo][0]} durante ${e.h} h. Até voltar, não há saídas nem arena.</p><p class="nota num">Regressa em ${fmtT(e.fim-agora())}. Se voltar antes, só contam as horas completas.</p></div><button class="btn sec" data-act="voltar">Regressar já</button></div>`}
  return `<div class="cartao">${arte('exped',56)}<div><h3>Expedição longa</h3><p class="lenda">Manda o faroleiro para longe enquanto dormes. Não gasta energia, mas até ele voltar não há saídas nem arena.</p><div class="solta"><button class="btn sec peq" data-act="hmenos" aria-label="Menos uma hora">−</button><b class="num">${horas} h</b><button class="btn sec peq" data-act="hmais" aria-label="Mais uma hora">+</button></div></div>
  <div class="acoes">${Object.keys(EXP).map(k=>`<button class="btn peq" data-act="partir" data-i="${k}:${horas}">+${ganhoExp(k,horas)} ${EXP[k][0]}</button>`).join('')}</div></div>`;
}
function vExplorar(){
  return `<h2>Carta da Costa Alagada</h2><p class="lenda">Cada saída gasta ${EN_ZONA} de energia. Cada zona pede um número de vitórias para desafiares o chefe; vencê-lo abre a zona seguinte. A luta resolve-se sozinha: o que conta é a preparação.</p>${auto!=null&&ZONAS[auto]?`<p class="nota" style="color:var(--musgo)">Automático ligado em ${ZONAS[auto].n}: explora sozinho sempre que houver energia, enquanto o jogo estiver aberto. ${esc(autoMsg)}</p>`:''}<div class="lista">`+vExped()+
  ZONAS.map((Z,i)=>{const tr=i>S.zc,fr=i===S.zc,w=S.zw||0,pronto=fr&&w>=bossN(i);return `<div class="cartao${tr?' trancado':''}">${arte(Z.a,56)}<div><h3>${Z.n}</h3><p class="lenda">${Z.d}</p><p class="nota num">Inimigos nv ${Z.base}–${Z.base+2} · força ×${String(Z.f).replace('.',',')} </p>${fr?`<p class="nota num">${pronto?'O chefe espera: '+Z.boss:'Chefe: '+Z.boss+' · '+w+'/'+bossN(i)+' vitórias'}</p>`:i<S.zc?`<p class="nota">Chefe vencido</p>`:''}</div>
  <div class="acoes"><button class="btn" data-act="exp" data-i="${i}" ${tr||S.exp||S.en<EN_ZONA?'disabled':''}>${tr?'Trancada':'Explorar'}</button>${tr?'':`<button class="btn sec peq" data-act="auto" data-i="${i}">${auto===i?'Parar':'Auto'}</button><button class="btn sec peq" data-act="expn" data-i="${i}:200" ${S.exp||S.en<EN_ZONA?'disabled':''}>Tudo</button>`}${pronto?`<button class="btn" data-act="boss" ${S.exp||S.en<EN_ZONA?'disabled':''}>Chefe</button>`:''}</div></div>`}).join('')+
  (!proxProva()?'':(P=>`<div class="cartao${S.nv<P.nv?' trancado':''}">${arte(S.classe,56)}<div><h3>${P.n}</h3><p class="lenda">Vence o ${P.boss} e tornas-te ${CLASSES[S.classe][P.t]}.</p><p class="nota">${CLASSES[S.classe][P.u]}</p><p class="nota num">Inimigo nv ${P.L} · ${P.en} energia</p></div>
  <button class="btn" data-act="prova" ${S.exp||S.nv<P.nv||S.en<P.en?'disabled':''}>${S.nv<P.nv?'Nível '+P.nv:'Enfrentar'}</button></div>`)(proxProva()))+
  `</div><p class="nota">Saídas ganhas: <span class="num">${S.vit}</span>. Uma em cada dez traz um Alfa: mais forte, larga sempre um objeto.</p>`;
}
function vHeroi(){
  return `<h2>${esc(S.nome)}, nível ${S.nv}</h2><p class="lenda">${titulo()}. ${poder()}</p>
  <h2>Atributos totais</h2><div class="stats"><span>Dano ${tipo()==='m'?'mágico':'físico'} <b class="num">${atk()}</b></span><span>Armadura física <b class="num">${armF()}</b></span><span>Armadura mágica <b class="num">${armM()}</b></span><span>Vida <b class="num">${maxHp()}</b></span><span>Esquiva <b class="num">${esq()}%</b></span><span>Crítico (dano ×2) <b class="num">${crit()}%</b></span><span>Ataque duplo <b class="num">${duplo()}%</b></span><span>Roubo de vida <b class="num">${roubo()}%</b></span><span>Refletir dano <b class="num">${refl()}%</b></span><span>XP extra <b class="num">${bXp()}%</b></span><span>Sal extra <b class="num">${bSal()}%</b></span></div><h2>Treino</h2>
  <p class="nota">Treina os atributos com sal. Cada ponto custa mais do que o anterior. Mantém um botão premido para continuar a subir até o largares ou o sal acabar.</p><div class="attrs treino">`+
  Object.keys(ATR).map(k=>`<div class="attr"><span>${ATR[k][0]} <b class="num">${S.attr[k]}${eqSoma(k)?' +'+eqSoma(k):''}</b><small>${ATR[k][1]}</small></span><div class="solta">${[1,10].map(n=>`<button class="btn peq" data-act="attr" data-i="${k}:${n}" aria-label="Subir ${ATR[k][0]} ${n} ${n>1?'pontos':'ponto'}" ${S.sal>=custoAtr(k)?'':'disabled'}>+${n} · <span class="num">${custoAtrN(k,n)}</span> sal</button>`).join('')}</div></div>`).join('')+`</div>
  <h2>Equipado</h2><div class="attrs equip">`+
  Object.keys(SLOT).map(s=>{const i=S.eq[s];return `<div class="attr"><span><small>${SLOT[s]}</small>${i?`<b class="r${i.r}">${nomeItem(i)}</b><small class="num">Nv ${i.nv} · ${descItem(i)}${descBonus(i)}</small>`:'Vazio'}</span>${i?`<button class="btn sec peq" data-act="tirar" data-i="${s}">Tirar</button><button class="btn sec peq" data-act="forja" data-i="${i.id}">Forja</button>`:''}</div>${i?forja(i):''}`}).join('')+
  `</div><h2>Mochila <span class="num nota">${S.inv.length}/20</span></h2>`+vLimpa()+`<div class="lista">`+
  (S.inv.length?S.inv.map(i=>`<div class="cartao"><div><h3 class="r${i.r}">${nomeItem(i)}</h3><p class="nota num">${SLOT[i.slot]} · ${RAR[i.r]} · Nv ${i.nv}</p><p class="nota num">${descItem(i)}${descBonus(i)}</p></div>
  <div class="acoes"><button class="btn peq" data-act="equipar" data-i="${i.id}">Equipar</button><button class="btn sec peq" data-act="vender" data-i="${i.id}">Vender ${i.val}</button><button class="btn sec peq" data-act="desmontar" data-i="${i.id}">Desmontar</button><button class="btn sec peq" data-act="forja" data-i="${i.id}">Forja</button></div></div>${forja(i)}`).join(''):'<p class="lenda">Vazia. Os inimigos largam objetos de vez em quando.</p>')+
  `</div>`;
}
function vFarol(){
  return `<h2>O teu farol</h2><p class="lenda">Melhora as construções com sal e sucata. Nenhuma pode passar do nível do Farol, e só há mãos para uma obra de cada vez.</p><div class="lista">`+
  Object.keys(EDIF).map(k=>{const n=S.ed[k],E=EDIF[k],c=custoEd(k),max=n>=10,aqui=S.obra&&S.obra.k===k,preso=!max&&!podeSubir(k),pode=!max&&!preso&&!S.obra&&S.sal>=c.sal&&S.suc>=c.suc;
  return `<div class="cartao">${arte(k,48)}<div><h3>${E.n} <span class="num nota">nv ${n}${aqui?' → '+(n+1):''}</span></h3><p class="nota">${E.d(n)}</p><p class="lenda">${E.p}</p>${max||aqui?'':`<p class="nota num">Obra: ${fmtT(tempoObra(k))}</p>`}</div>
  <button class="btn" data-act="obra" data-i="${k}" ${pode?'':'disabled'}>${max?'Máximo':aqui?`Em obra<br><span class="num">${fmtT(S.obra.fim-agora())}</span>`:preso?(k==='incubadora'&&S.nv<(n+1)*10?'Nível '+(n+1)*10:'Sobe o Farol'):`<span class="num">${c.sal}</span> sal<br><span class="num">${c.suc}</span> sucata`}</button></div>`}).join('')+`</div>`+vPets();
}
function vArena(){
  const sims=SIMULADOS.map((r,i)=>({k:'s:'+i,n:r[0],p:r[1],nv:Math.max(1,Math.round(r[1]/45))}));
  const perto=l=>l.slice().sort((a,b)=>Math.abs(a.p-S.pontos)-Math.abs(b.p-S.pontos));
  const alvos=perto(reais.map(r=>Object.assign({k:'r:'+r.id},r))).slice(0,4).concat(perto(sims).slice(0,reais.length?2:3)).sort((a,b)=>a.p-b.p);
  const todos=reais.concat(sims,[{n:S.nome,p:S.pontos,eu:1}]).sort((a,b)=>b.p-a.p);
  const esp=S.bil<5?` · próximo em ${Math.ceil((BIL_MS-(agora()-S.tB))/60000)} min`:'';
  const estado=nuvem==='ligado'?(reais.length?`Há ${reais.length} ${reais.length>1?'amigos':'amigo'} na arena.`:'Ainda nenhum amigo abriu o jogo. Quando entrarem no jogo aparecem aqui.'):'Sem ligação à conta: só há rivais simulados.';
  return `<h2>Arena dos Fantasmas</h2><p class="lenda">Lutas contra a cópia do faroleiro de um amigo, por isso ele não precisa de estar ligado.</p>
  <p class="nota">${estado}</p><p class="nota">Bilhetes: <b class="num">${S.bil}/5</b>${esp}</p><div class="lista">`+
  alvos.map(a=>`<div class="cartao">${arte('serpente',44)}<div><h3>${esc(a.n)} <span class="selo${a.real?'':' sim'}">${a.real?'amigo':'simulado'}</span></h3><p class="nota num">${a.p} pontos · nv ${a.nv}</p></div><button class="btn" data-act="arena" data-i="${esc(a.k)}" ${S.bil&&!S.exp?'':'disabled'}>Desafiar</button></div>`).join('')+
  `</div><h2>Classificação</h2><table><tr><th>#</th><th>Faroleiro</th><th>Pontos</th></tr>`+
  todos.map((t,i)=>`<tr${t.eu?' class="eu"':''}><td class="num">${i+1}</td><td>${esc(t.n)}${t.eu?' (tu)':t.real?' <span class="selo">amigo</span>':''}</td><td class="num">${t.p}</td></tr>`).join('')+`</table>`;
}
function vOpcoes(){
  return `<h2>Opções</h2><h3 class="sub">Nome do faroleiro</h3><div class="solta"><input type="text" id="nome" maxlength="16" value="${esc(S.nome)}" aria-label="Nome do faroleiro"><button class="btn sec peq" data-act="nome">Mudar</button></div>
  <h3 class="sub">Código de bónus</h3><div class="solta"><input type="text" id="codigo" maxlength="20" autocomplete="off" autocapitalize="characters" aria-label="Código de bónus" placeholder="Escreve o código"><button class="btn peq" data-act="codigo">Usar</button></div>
  <h3 class="sub">Progresso</h3><p class="nota">Guardado no servidor, na tua conta.</p>
  <div class="solta"><button class="btn sec peq" data-act="reset">${confirmar?'Confirmar: apagar tudo':'Recomeçar do zero'}</button></div>`;
}
function desenhar(){
  if(!S)return;
  const av=R.recuperar(); if(av)aviso=av; topo();
  $('ecra').innerHTML=(aviso?`<p class="nota" style="color:var(--lacre)">${esc(aviso)}</p>`:'')+(S.classe?{explorar:vExplorar,heroi:vHeroi,loja:vLoja,farol:vFarol,arena:vArena,opcoes:vOpcoes}[tab]:vClasse)();
  aviso='';
  document.querySelectorAll('#nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab));
}
function falha(msg){
  aviso=msg;
  if(S)desenhar(); else $('ecra').innerHTML=`<p class="nota">${esc(msg)}</p><div class="solta"><button class="btn" data-act="ligar">Tentar outra vez</button></div>`;
}
async function pedir(acao,arg,quieto){
  if(ocupado)return; ocupado=true; $('app').classList.add('ocupado');
  try{
    const {data,error}=await sb.functions.invoke('jogo',{body:{acao,arg}});
    if(error||!data||!data.S)throw error||new Error('resposta');
    desvio=data.agora-Date.now(); S=R.usar(data.S);
    reais=(data.rivais||[]).map(r=>limpar(r.id,r.perfil));
    if(data.aviso)aviso=data.aviso;
    if(quieto){if(data.luta)autoMsg=resumo(data.luta.linhas);else autoEspera=agora()+15000;if(tab==='explorar')desenhar();else topo()}
    else if(data.luta)mostrarLuta(data.luta.a,data.luta.b,data.luta.linhas,data.luta.img); else desenhar();
  }catch(e){console.error(e);if(quieto)auto=null;falha('Sem ligação ao servidor. Tenta outra vez.')}
  ocupado=false; $('app').classList.remove('ocupado');
}
$('nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.tab;confirmar=false;desenhar();$('ecra').scrollTop=0};
$('ecra').onclick=e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const a=b.dataset.act;let i=b.dataset.i;
  if(ignorar)return;
  if(a==='ligar')return arrancar();
  if(a==='auto'){auto=auto===+i?null:+i;autoMsg='';autoEspera=0;return desenhar()}
  if(a==='forja'){aberto=aberto==i?null:i;return desenhar()}
  if(a==='hmais'||a==='hmenos'){horas=Math.min(10,Math.max(1,horas+(a==='hmais'?1:-1)));return desenhar()}
  if(a==='reset'){if(!confirmar){confirmar=true;return desenhar()}confirmar=false;tab='explorar';return pedir('reset')}
  confirmar=false;
  if(a==='nome')i=$('nome').value;
  if(a==='codigo')i=$('codigo').value;
  pedir(a,i);
};
$('ecra').addEventListener('change',e=>{if(e.target.id==='rarAte'){rarSel=+e.target.value;desenhar()}});
/* Manter premido: vai mostrando o treino no ecrã e, ao largar, pede tudo ao servidor de uma vez. */
let seg=null, ignorar=false;
function largar(){
  const s=seg; if(!s)return; clearTimeout(s.t); clearInterval(s.r); seg=null;
  if(s.n){ignorar=true;setTimeout(()=>ignorar=false,60);pedir('attr',s.k+':'+s.n*s.q)}
}
$('ecra').addEventListener('pointerdown',e=>{
  const b=e.target.closest('[data-act="attr"]'); if(!b||b.disabled||ocupado)return; largar();
  const [k,q]=b.dataset.i.split(':'), s=seg={n:0,k,q:+q};
  s.t=setTimeout(()=>{s.r=setInterval(()=>{if(seg!==s)return;if(!R.treinar(b.dataset.i))return largar();s.n++;desenhar()},110)},400);
});
for(const ev of ['pointerup','pointercancel'])document.addEventListener(ev,largar);
window.addEventListener('blur',largar);
$('ecra').addEventListener('contextmenu',e=>{if(seg)e.preventDefault()});

let aCorrer=false;
async function arrancar(){
  $('ecra').innerHTML='<p class="lenda">A acender a lanterna…</p>';
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY)return falha('Falta preencher o ficheiro config.js com os dados do teu projeto Supabase.');
  const {data:{session}}=await sb.auth.getSession();
  if(!session){const {error}=await sb.auth.signInAnonymously();if(error){console.error(error);return falha('Não foi possível criar a sessão. Confirma que as entradas anónimas estão ativas no Supabase.')}}
  await pedir('estado');
  if(aCorrer)return; aCorrer=true;
  setInterval(()=>{
    if(!S||ocupado||!$('luta').hidden)return;
    const antes=S.en,obra=!!(S.obra||S.choco),ex=!!S.exp,av=R.recuperar(); if(av)aviso=av; topo();
    if(auto!=null&&!S.exp&&S.en>=EN_ZONA&&agora()>=autoEspera)return pedir('expn',auto+':200',true);
    if(tab==='loja'&&S.loja&&agora()-S.loja.t>=LOJA_MS)return pedir('estado');
    if(S.en!==antes&&tab==='explorar'||obra&&(tab==='farol'||!(S.obra||S.choco))||ex&&(tab==='explorar'||!S.exp))desenhar();
  },1000);
}
arrancar();
