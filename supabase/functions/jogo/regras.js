// Regras do Farol de Sal. Este ficheiro corre no servidor (função "jogo") e na app (só para mostrar valores).
// Depois de o alterares, corre "npm run sync" para copiar a versão do servidor.
let S, agora=()=>Date.now();
const SUC_MS=300000, HP_MS=3000, SAL_MS=60000, BIL_MS=300000;
const ZONAS=[
 {n:'Cais Afundado',a:'cais',d:'Tábuas podres e caranguejos que comem pregos.',nv:1,base:1,custo:2,f:1,boss:'Rei Caranguejo',ini:['Caranguejo-ferrugem','Gaivota de três olhos','Rato de porão']},
 {n:'Salinas Mortas',a:'salinas',d:'Montes brancos até perder de vista. Algo se mexe na crosta.',nv:3,base:3,custo:3,f:1.3,boss:'Mãe da Salmoura',ini:['Cão de salina','Saqueador de marés','Larva de salmoura']},
 {n:'Cemitério de Traineiras',a:'traineiras',d:'Cascos empilhados. Quem lá vive não gosta de visitas.',nv:6,base:6,custo:4,f:1.7,boss:'Capitão dos Cascos',ini:['Sucateiro mascarado','Polvo de cabos','Mergulhador afogado']},
 {n:'Conserveira Alagada',a:'conserveira',d:'As máquinas ainda trabalham. Ninguém sabe para quem.',nv:10,base:10,custo:5,f:2.2,boss:'A Grande Prensa',ini:['Autómato da conserveira','Capataz de lata','Enguia de néon']},
 {n:'Plataforma Negra',a:'plataforma',d:'Hic sunt dracones. Aço, gasóleo e a coisa que dorme por baixo.',nv:15,base:15,custo:6,f:2.8,boss:'Engenheiro Afogado',ini:['Guarda da plataforma','Medusa de crude','Cria do Leviatã']},
 {n:'Recife de Vidro',a:'recife',d:'Cristais que cortam cascos. O que lá vive aprendeu a brilhar.',nv:20,base:20,custo:7,f:3.2,boss:'Hidra de Vidro',ini:['Moreia de vidro','Ouriço de lâminas','Fogo-fátuo do recife']},
 {n:'Cidade Submersa',a:'cidade',d:'Ruas inteiras debaixo de água. As janelas ainda se acendem.',nv:28,base:28,custo:8,f:3.8,boss:'Regedor Submerso',ini:['Sentinela enferrujada','Sereia de arame','Sacristão afogado']},
 {n:'Fossa dos Sinos',a:'sinos',d:'Lá no fundo tocam sinos. Ninguém os pôs lá.',nv:36,base:36,custo:9,f:4.5,boss:'O Sino Maior',ini:['Sineiro cego','Tubarão-sino','Coro dos afogados']},
 {n:'Mar de Sargaço Negro',a:'sargaco',d:'A água não se mexe. As algas, sim.',nv:45,base:45,custo:10,f:5.3,boss:'Coração do Sargaço',ini:['Nó de sargaço','Barqueiro sem rosto','Lume das algas']},
 {n:'Boca do Leviatã',a:'boca',d:'Fim da carta. Daqui para a frente, só dentes.',nv:55,base:55,custo:12,f:6.2,boss:'A Língua do Leviatã',ini:['Dente andante','Parasita real','Eco do Leviatã']}
];
const EDIF={
 farol:{n:'Farol',d:n=>`Nenhuma construção passa do nível ${n}`,p:'A torre principal. Limita o nível de todas as outras construções'},
 lanterna:{n:'Lanterna',d:n=>`+${4*n} de energia máxima · 1 a cada ${enSeg(n).toFixed(1).replace('.0','').replace('.',',')} s`,p:'Por nível: +4 de energia máxima e recarga 1,2 s mais rápida'},
 destilaria:{n:'Destilaria',d:n=>`${2*n} de sal por minuto`,p:'Produz sal mesmo com o jogo fechado (até 8 h)'},
 oficina:{n:'Oficina',d:n=>`+${5*n}% de dano`,p:'+5% de dano por nível'},
 sucateira:{n:'Sucateira',d:n=>`${n} de sucata a cada 5 min`,p:'Recolhe sucata mesmo com o jogo fechado (até 8 h)'},
 incubadora:{n:'Incubadora',d:n=>n?`Choca mascotes até à versão ${n}`:'Por construir',p:'Cada nível liberta uma versão mais forte das mascotes e pede mais 10 níveis teus'}
};
const RAR=['Comum','Incomum','Raro','Épico','Lendário','Mítico','Artefacto'], MULT=[1,1.4,1.9,2.6,3.4,4.4,5.8], RAR_NV=[1,10,20,30,40,60,80], NV_MAX=100;
const NOMES={arma:['Arpão','Gancho de estiva','Faca de escalar','Remo ferrado','Croque'],capacete:['Sueste','Barrete de lã','Elmo de panela','Capuz de oleado','Capacete de mergulho'],armadura:['Oleado','Colete de cortiça','Casaco de rede','Peitoral de chapa','Escafandro'],luvas:['Luvas de estiva','Manoplas de rede','Luvas de couro','Mitenes de lona','Punhos de chapa'],calcas:['Calças de oleado','Jardineiras','Calças de lona','Perneiras de cortiça','Grevas de chapa'],botas:['Galochas','Botas de água','Socos de madeira','Botas ferradas','Botins de pesca'],anel:['Anel de latão','Aliança de sal','Anel de búzio','Argola de âncora','Sinete do faroleiro'],colar:['Búzio','Anzol da sorte','Bússola parada','Dente de tubarão','Vidro do mar']};
const PESO={capacete:.6,armadura:1,luvas:.4,calcas:.6,botas:.4}, VIDA={capacete:1.5,armadura:4,calcas:1.5,colar:3};
const SUF=['','reforçado','de mestre','do abismo','das marés','do Leviatã','da Luz Velha'];
const SLOT={arma:'Arma',capacete:'Capacete',armadura:'Armadura',luvas:'Luvas',calcas:'Calças',botas:'Botas',anel:'Anel',colar:'Colar'};
const ATR={for:['Força','Dano do Escudo · armadura física'],agi:['Agilidade','Dano do Sniper · esquiva'],int:['Inteligência','Dano do Mago · armadura mágica'],res:['Resistência','Vida'],sor:['Sorte','Crítico · ataque duplo · loot raro']};
const MAGICOS=new Set(['Gaivota de três olhos','Larva de salmoura','Mergulhador afogado','Enguia de néon','Medusa de crude','Fogo-fátuo do recife','Sereia de arame','Coro dos afogados','Lume das algas','Eco do Leviatã','Mãe da Salmoura','Hidra de Vidro','O Sino Maior','Coração do Sargaço']);
const ROT={atk:' dano',def:' armadura física',am:' armadura mágica',hp:' vida',pd:'% dano',pv:'% vida',bx:'% XP extra',bs:'% sal extra',crit:'% crítico',rv:'% roubo de vida',rf:'% refletir dano',for:' Força',agi:' Agilidade',int:' Inteligência',res:' Resistência',sor:' Sorte'};
const CRESCE=new Set(['atk','def','am','hp','pd','pv','bx','bs']);
const CLASSES={
 escudo:{n:'Escudo do Farol',p:'Baluarte do Farol',m:'for',d:'Ataca com a Força. Cada ponto de Resistência dá o dobro da vida.',u:'Devolve ao adversário 20% do dano que sofre.',p2:'Muralha do Farol',u2:'Devolve 35% do dano que sofre e ganha +20% de vida.'},
 mago:{n:'Mago do Farol',p:'Arquimago do Farol',m:'int',d:'Ataca com a Inteligência. Vida normal por ponto de Resistência.',u:'+20% de dano e recupera em vida 10% do dano que causa.',p2:'Oráculo do Farol',u2:'+40% de dano e recupera em vida 20% do dano que causa.'},
 sniper:{n:'Sniper do Farol',p:'Olho do Farol',m:'agi',d:'Ataca com a Agilidade, que também dá esquiva. Vida normal por ponto de Resistência.',u:'Esquiva-se mais facilmente: o limite sobe de 25% para 30%.',p2:'Vento do Farol',u2:'Limite de esquiva a 35% e de ataque duplo a 30%.'}
};
const ESQ_MAX=25, ESQ_SNIPER=30, LOJA_MS=1800000;
const PROVAS=[{n:'Prova do Farol',nv:20,en:8,boss:'Guardião da Luz Velha',L:22,k:3,t:'p',u:'u'},{n:'Prova do Abismo',nv:60,en:15,boss:'Leviatã',L:62,k:8,t:'p2',u:'u2'}];
const proxProva=()=>PROVAS[+S.prom||0]||null;
const titulo=()=>{const C=CLASSES[S.classe];return [C.n,C.p,C.p2][+S.prom||0]}, poder=()=>{const C=CLASSES[S.classe];return [C.d,C.u,C.u2][+S.prom||0]};
const SIMULADOS=[['Zé da Barra',60],['Mariana Sargaço',95],['Tó Lapa',140],['Avó Ilídia',190],['Quim Enxada',260],['Bia Maré-Viva',340],['Capitão Nortada',450],['Rosa dos Ventos',600],['O Velho do Restelo',800]];
function novo(){const t=agora();return{nome:'Faroleiro',nv:1,xp:0,pts:0,attr:{for:3,int:3,agi:3,res:3,sor:3},classe:null,prom:0,loja:null,obra:null,exp:null,pets:{},pet:null,choco:null,zc:0,zw:0,lixo:null,usados:[],hp:999,sal:30,suc:5,en:20,tE:t,tH:t,tS:t,tB:t,bil:5,inv:[],eq:{arma:null,capacete:null,armadura:null,luvas:null,calcas:null,botas:null,anel:null,colar:null},tU:t,ed:{farol:1,lanterna:0,destilaria:0,oficina:0,sucateira:0,incubadora:0},pontos:100,vit:0,id:1,t:0}}
const R=(a,b)=>a+Math.random()*(b-a), RI=(a,b)=>Math.floor(R(a,b+1)), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lim=(x,a,b)=>{x=Number(x);return isFinite(x)?Math.min(b,Math.max(a,x)):a};
const base=(i,k)=>CRESCE.has(k)?Math.round(i[k]*(1+.08*(i.up||0))):i[k];   // cada melhoria da forja dá +8% aos valores base
function eqSoma(k){let t=0;for(const s in S.eq){const i=S.eq[s];if(!i)continue;if(i[k])t+=base(i,k);if(i.b)for(const [bk,v] of i.b)if(bk===k)t+=v}return t}
const A=k=>S.attr[k]+eqSoma(k);   // atributo total: treinado + bónus do equipamento
function normalizar(x){x=Object.assign(novo(),x);if(x.attr.int==null)x.attr.int=3;if(!CLASSES[x.classe])x.classe=null;if(x.ed.enfermaria!=null){x.ed.sucateira=x.ed.sucateira||x.ed.enfermaria;delete x.ed.enfermaria}if(x.ed.sucateira==null)x.ed.sucateira=0;if(x.ed.farol==null)x.ed.farol=Math.max(1,x.ed.lanterna||0,x.ed.destilaria||0,x.ed.oficina||0,x.ed.sucateira||0);const am=i=>{if(i&&i.slot==='amuleto')i.slot='colar';return i};x.inv.forEach(am);if(x.loja&&x.loja.it)x.loja.it.forEach(am);if(x.eq.amuleto){x.eq.colar=am(x.eq.amuleto)}delete x.eq.amuleto;for(const k in SLOT)if(x.eq[k]===undefined)x.eq[k]=null;if(x.zc==null){x.zc=Math.max(0,ZONAS.filter(z=>z.nv<=x.nv).length-1);x.zw=0}if(x.ed.incubadora==null)x.ed.incubadora=0;if(!x.pets||typeof x.pets!=='object')x.pets={};const lp=i=>{if(!i)return;delete i.rv;delete i.rf;if(!i.b)return;const n=i.b.length;i.b=i.b.filter(e=>e[0]!=='rv'&&e[0]!=='rf');const livres=Object.keys(BONUS).filter(k=>!i.b.some(e=>e[0]===k));while(i.b.length<n&&livres.length){const k=livres.splice(RI(0,livres.length-1),1)[0];i.b.push([k,BONUS[k](i)])}};x.inv.forEach(lp);Object.values(x.eq).forEach(lp);if(x.loja&&x.loja.it)x.loja.it.forEach(lp);x.nv=Math.min(100,x.nv);x.prom=x.prom===true?1:Math.min(2,+x.prom||0);if(x.pts){x.sal+=x.pts*30;x.pts=0}return x}
const grau=c=>S.classe===c?(+S.prom||0):0, prom=c=>grau(c)>=1;
const maxHp=()=>Math.round((60+A('res')*(S.classe==='escudo'?24:12)+S.nv*8+eqSoma('hp'))*(grau('escudo')>=2?1.2:1)*(1+eqSoma('pv')/100)*(1+.04*petB('vida')));
const atk=()=>Math.round((6+A(S.classe?CLASSES[S.classe].m:'for')*2+eqSoma('atk'))*(1+.05*S.ed.oficina)*(1+eqSoma('pd')/100)*(1+.03*petB('dano'))*[1,1.2,1.4][grau('mago')]);
const tipo=()=>S.classe==='mago'?'m':'f';
const armF=()=>Math.round(A('for')*.8+eqSoma('def'));
const armM=()=>Math.round(A('int')*.8+eqSoma('am'));
const duplo=()=>Math.min(grau('sniper')>=2?30:20,Math.round(A('sor')*.6))+2*petB('duplo');
const roubo=()=>Math.min(30,[0,10,20][grau('mago')]+1.5*petB('roubo'));
const refl=()=>Math.min(50,[0,20,35][grau('escudo')]+2*petB('refl'));
const bXp=()=>eqSoma('bx')+5*petB('xp'), bSal=()=>eqSoma('bs')+5*petB('sal');
const combate=()=>({max:maxHp(),dano:atk(),tipo:tipo(),af:armF(),am:armM(),crit:crit(),duplo:duplo(),esq:esq(),agi:A('agi'),refl:refl()/100,roubo:roubo()/100});
const crit=()=>Math.min(25,Math.round(3+A('sor')*.8+eqSoma('crit')));
const esq=()=>{const g=grau('sniper');return Math.min([ESQ_MAX,ESQ_SNIPER,35][g],Math.round(A('agi')*(g?1.5:1.2)))};
const maxEn=()=>20+4*S.ed.lanterna+4*(S.nv-1);
const enSeg=n=>Math.max(8,20-1.2*n), enMs=()=>enSeg(S.ed.lanterna)*1000;
const custoAtr=k=>Math.round(15*Math.pow(1.12,S.attr[k]-3));
const xpNec=()=>Math.round(280*Math.pow(S.nv,2.4));   // afinada para o nível acompanhar as zonas: cerca de 20 ao chegar à zona 6, 55 à zona 10
const custo=n=>({sal:Math.round(40*Math.pow(1.7,n)),suc:Math.round(6*Math.pow(1.6,n))});
const custoEd=k=>k==='farol'?{sal:Math.round(90*Math.pow(1.8,S.ed.farol)),suc:Math.round(14*Math.pow(1.7,S.ed.farol))}:custo(S.ed[k]);
const podeSubir=k=>S.ed[k]<10&&(k==='farol'||S.ed[k]<S.ed.farol)&&(k!=='incubadora'||S.nv>=(S.ed[k]+1)*10);
const tempoObra=k=>Math.round(60000*Math.pow(1.8,S.ed[k])*(k==='farol'?1.5:1));
function fmtT(ms){const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} h ${m} min`:m?`${m} min ${s%60} s`:`${s} s`}
const perfil=()=>Object.assign({nome:S.nome,nv:S.nv,pontos:S.pontos},combate());
function limpar(id,d){d=d||{};return{id,real:1,n:String(d.nome||'Faroleiro').slice(0,16),nv:lim(d.nv,1,999),p:Math.round(lim(d.pontos,0,99999)),max:lim(d.max,50,99999),dano:lim(d.dano??d.atk,1,99999),tipo:d.tipo==='m'?'m':'f',af:lim(d.af??d.def,0,9999),am:lim(d.am??d.def,0,9999),crit:lim(d.crit,0,25),duplo:lim(d.duplo,0,50),esq:lim(d.esq,0,35),agi:lim(d.agi,0,999),refl:lim(d.refl,0,.5),roubo:lim(d.roubo,0,.3)}}
function recuperar(){
  const t=agora(); let n, av='';
  if(S.obra&&t>=S.obra.fim){const k=S.obra.k;S.obra=null;if(EDIF[k]&&S.ed[k]<10){S.ed[k]++;av=`Obra concluída: ${EDIF[k].n} no nível ${S.ed[k]}.`}}
  if(S.exp&&t>=S.exp.fim)av=(av?av+' ':'')+fechaExp(S.exp.h);
  if(S.choco&&t>=S.choco.fim){const k=S.choco.k;S.choco=null;if(PETS[k]){S.pets[k]=Math.min(10,(S.pets[k]||0)+1);if(!S.pet)S.pet=k;av=(av?av+' ':'')+`${PETS[k][0]} saiu da incubadora na versão ${S.pets[k]}.`}}
  if(S.en>=maxEn())S.tE=t; else{n=Math.floor((t-S.tE)/enMs());if(n>0){S.en=Math.min(maxEn(),S.en+n);S.tE+=n*enMs()}}
  const mh=maxHp(); if(S.hp>mh)S.hp=mh;
  n=Math.floor((t-S.tU)/SUC_MS); if(n>0){S.suc+=Math.min(n,96)*S.ed.sucateira;S.tU+=n*SUC_MS}
  n=Math.floor((t-S.tS)/SAL_MS); if(n>0){S.sal+=Math.min(n,480)*2*S.ed.destilaria;S.tS+=n*SAL_MS}
  if(S.bil>=5)S.tB=t; else{n=Math.floor((t-S.tB)/BIL_MS);if(n>0){S.bil=Math.min(5,S.bil+n);S.tB+=n*BIL_MS}}
  return av;
}
const RAR_P=[0,28,12,5,2,.8,.3], NBON=[1,1,1,1,2,2,3], BM=[1,1.5,2.2,3,4,5.2,7], JM=[1,1.3,1.7,2.2,2.8,3.5,4.5];
const BONUS={};   // só atributos; roubo de vida e refletir dano vêm apenas da classe
for(const k of ['for','agi','int','res','sor'])BONUS[k]=it=>Math.max(1,Math.round((1+it.nv*.08)*BM[it.r]));
/** Raridade sorteada entre as que o nível do jogador já libertou. */
function sorteiaRar(){const lk=Math.min(3,1+A('sor')*.02);for(let r=6;r>0;r--)if(S.nv>=RAR_NV[r]&&Math.random()*100<RAR_P[r]*lk)return r;return 0}
function novosBonus(it){it.b=Object.keys(BONUS).sort(()=>Math.random()-.5).slice(0,NBON[it.r]).map(k=>[k,BONUS[k](it)])}
function gerarItem(nv,fr){
  const slot=Object.keys(SLOT)[RI(0,7)], r=fr??sorteiaRar(), m=MULT[r];
  const it={id:S.id++,slot,r,nv,up:0,nome:NOMES[slot][RI(0,4)]+(SUF[r]?' '+SUF[r]:'')};
  if(slot==='arma')it.atk=Math.round((3+nv*1.6)*m);
  if(PESO[slot])it.def=Math.max(1,Math.round((1+nv*.45)*PESO[slot]*m));
  if(slot==='anel'||slot==='colar'){
    it.am=Math.max(1,Math.round((1+nv*.65)*m));
    const j=['bx','bs','pd','pv'][RI(0,3)]; it[j]=Math.max(1,Math.round((j==='bx'||j==='bs'?4+nv*.15:2+nv*.06)*JM[r]));
  }
  if(VIDA[slot])it.hp=Math.round(nv*VIDA[slot]*m);
  novosBonus(it);
  it.val=Math.round((6+nv*5)*m); return it;
}
const nomeItem=i=>i.nome+(i.up?' +'+i.up:'');
function descItem(i){const p=[];for(const k of ['atk','def','am','hp','pd','pv','bx','bs','crit'])if(i[k])p.push('+'+base(i,k)+ROT[k]);return p.join(' · ')}
const descBonus=i=>i.b&&i.b.length?'<br>Bónus: '+i.b.map(([k,v])=>'+'+v+ROT[k]).join(' · '):'';
const achar=id=>S.inv.find(x=>x.id==id)||Object.values(S.eq).find(x=>x&&x.id==id)||null;
const custoUp=i=>({sal:Math.round(i.val*1.5*((i.up||0)+1)),suc:Math.ceil((2+i.nv/5)*((i.up||0)+1))});
const custoTroca=i=>({sal:i.val*2,suc:Math.ceil(3+i.nv/4)});
/** Chance de a forja resultar: desce a cada nível e sobe 10% por cada falha seguida no mesmo objeto. */
const chanceUp=i=>Math.min(100,[100,95,90,80,70,60,50,40,30,20][i.up||0]+10*(i.fz||0));
function melhorar(id){
  const it=achar(id); if(!it||(it.up||0)>=10)return '';
  const c=custoUp(it); if(S.sal<c.sal||S.suc<c.suc)return '';
  S.sal-=c.sal;S.suc-=c.suc;
  if(Math.random()*100<chanceUp(it)){it.up=(it.up||0)+1;it.fz=0;return `A forja resultou: ${nomeItem(it)}.`}
  it.fz=(it.fz||0)+1; return `A forja falhou. ${nomeItem(it)} fica igual e a próxima tentativa tem ${chanceUp(it)}% de chance.`;
}
function trocarBonus(id){
  const it=achar(id); if(!it)return '';
  const c=custoTroca(it); if(S.sal<c.sal||S.suc<c.suc)return '';
  S.sal-=c.sal;S.suc-=c.suc;novosBonus(it); return `Bónus novos em ${nomeItem(it)}.`;
}

function eu(){return Object.assign({n:S.nome,hp:maxHp()},combate())}
function inimigo(nome,L,k){return{n:nome,max:Math.round((30+L*14)*k),dano:(5+L*2.6)*k,tipo:MAGICOS.has(nome.replace('Alfa ',''))?'m':'f',af:L*.7*k,am:L*.7*k,crit:8,duplo:0,esq:Math.min(25,4+L*.6),agi:L*.9,hp:0}}
function simular(a,b){
  b.hp=b.max; const reg=[]; let at=a.agi>=b.agi?a:b, df=at===a?b:a;
  for(let r=0;r<80&&a.hp>0&&b.hp>0;r++){
    const meu=at===a, golpes=Math.random()*100<(at.duplo||0)?2:1;
    for(let g=0;g<golpes&&a.hp>0&&b.hp>0;g++){
      const pre=g?'Ataque duplo! ':'';
      if(Math.random()*100<df.esq){reg.push({c:meu?'t':'e',m:`${pre}${df.n} esquiva-se do golpe de ${at.n}.`,a:a.hp,b:b.hp});continue}
      let d=Math.max(1,at.dano*R(.85,1.15)-(at.tipo==='m'?df.am:df.af)*.5);const c=Math.random()*100<at.crit;if(c)d*=2;d=Math.round(d);df.hp=Math.max(0,df.hp-d);
      let m=`${pre}${at.n} acerta em ${df.n}: ${d} de dano ${at.tipo==='m'?'mágico':'físico'}${c?' (crítico!)':''}.`;
      if(at.roubo&&at.hp>0){const h=Math.min(at.max-at.hp,Math.round(d*at.roubo));if(h>0){at.hp+=h;m+=` Absorve ${h} de vida.`}}
      if(df.refl&&df.hp>0){const x=Math.min(at.hp-1,Math.round(d*df.refl));if(x>0){at.hp-=x;m+=` ${df.n} devolve ${x}.`}}
      reg.push({c:meu?'t':'e',m,a:a.hp,b:b.hp});
    }
    [at,df]=[df,at];
  }
  return{reg,ganhou:b.hp<=0&&a.hp>0};
}
function ganhaXp(x,extra){if(S.nv>=NV_MAX){S.xp=0;return}S.xp+=x;while(S.nv<NV_MAX&&S.xp>=xpNec()){S.xp-=xpNec();S.nv++;S.en+=4;extra.push({c:'f',m:`Subiste para o nível ${S.nv}!`})}if(S.nv>=NV_MAX)S.xp=0}
const custoRenovar=()=>20+S.nv*5;
function stock(forcar){
  if(S.loja&&!forcar&&agora()-S.loja.t<LOJA_MS)return;
  S.loja={t:agora(),it:[0,1,2,3,4,5].map(()=>{const i=gerarItem(S.nv+RI(0,2));i.preco=i.val*4;return i})};
}
function gastaEnergia(n){if(S.en>=maxEn())S.tE=agora();S.en-=n}
const cena=(a,b,linhas,img)=>({a:{n:a.n,max:a.max},b:{n:b.n,max:b.max},linhas,img});
const PETS={xp:['Coruja-do-farol','% XP extra',5],sal:['Caranguejo salineiro','% sal extra',5],vida:['Tartaruga-de-pedra','% vida',4],dano:['Lontra-arpão','% dano',3],roubo:['Lampreia-da-maré','% roubo de vida',1.5],duplo:['Gaivota gémea','% ataque duplo',2],refl:['Ouriço-espelho','% refletir dano',2]};
const petB=k=>S.pet===k?(S.pets[k]||0):0;   // versão da mascote que te acompanha, se for deste tipo
const custoPet=t=>({sal:Math.round(300*Math.pow(2.2,t-1)),suc:Math.round(30*Math.pow(1.8,t-1)),ms:Math.round(300000*Math.pow(1.8,t-1))});
function chocar(k){
  if(!Object.hasOwn(PETS,k)||S.choco)return '';
  const t=(S.pets[k]||0)+1; if(t>S.ed.incubadora)return '';
  const c=custoPet(t); if(S.sal<c.sal||S.suc<c.suc)return '';
  S.sal-=c.sal;S.suc-=c.suc;S.choco={k,fim:agora()+c.ms}; return `${PETS[k][0]} está na incubadora.`;
}
function levarPet(k){if(Object.hasOwn(PETS,k)&&S.pets[k]){S.pet=k;return `${PETS[k][0]} vai contigo.`}return ''}
const BOSS_W=[200,700,1500,3100,6300,8300,11300,15300,20300,26300], bossN=z=>BOSS_W[Math.min(z,BOSS_W.length-1)], bossF=z=>z<3?4:5, EN_ZONA=4;   // vitórias pedidas antes do chefe de cada zona
/** Luta contra o chefe da zona de fronteira. Devolve [a, b, linhas, desenho] ou null se ainda não pode. */
function boss(){
  const Z=ZONAS[S.zc]; if(!Z||S.exp||(S.zw||0)<bossN(S.zc)||S.en<EN_ZONA)return null;
  if(S.en>=maxEn())S.tE=agora(); S.en-=EN_ZONA;
  const L=Z.base+3, a=eu(), b=inimigo(Z.boss,L,Z.f*bossF(S.zc)), res=simular(a,b), fim=[];
  if(res.ganhou){
    const sal=Math.round((5+L*4)*Z.f*5*(1+bSal()/100)), xp=Math.round((12+L*6)*Z.f*5*(1+bXp()/100));
    S.sal+=sal;S.zc++;S.zw=0;
    fim.push({c:'f',m:`${Z.boss} caiu! +${xp} XP, +${sal} sal.`});
    {const it=gerarItem(L),rc=recicla(it);if(rc)fim.push({c:'t',m:txtRec(it,rc)});else if(S.inv.length<20){S.inv.push(it);fim.push({c:'p',m:`Encontraste: ${it.nome} (${RAR[it.r]}).`})}}
    fim.push({c:'p',m:ZONAS[S.zc]?`Caminho aberto: ${ZONAS[S.zc].n}.`:'Chegaste ao fim da carta.'});
    ganhaXp(xp,fim);
  }else{const p=Math.ceil(bossN(S.zc)*.05);S.zw=bossN(S.zc)-p;fim.push({c:'f',m:`${Z.boss} resistiu. Vence mais ${p} saídas nesta zona para o voltares a desafiar.`})}
  return [a,b,res.reg.concat(fim),Z.a];
}
const valSuc=it=>Math.ceil((1+it.nv/2)*MULT[it.r]);
/** Regra automática: se o objeto acabado de apanhar for de raridade abrangida, vira logo sal ou sucata. */
function recicla(it){const m=S.lixo;if(!m||!(it.r<=m.ate))return null;if(m.modo==='desmontar'){const s=valSuc(it);S.suc+=s;return [0,s]}S.sal+=it.val;return [it.val,0]}
const txtRec=(it,rc)=>`${it.nome} (${RAR[it.r]}) ${rc[0]?'vendido: +'+rc[0]+' sal':'desmontado: +'+rc[1]+' sucata'}.`;
const parRar=i=>{const [modo,a]=String(i).split(':'),ate=Math.floor(Number(a));return (modo==='vender'||modo==='desmontar')&&ate>=-1&&ate<=6?{modo,ate}:null};
function limparMochila(i){
  const p=parRar(i); if(!p||p.ate<0)return ''; let n=0,g=0;
  S.inv=S.inv.filter(it=>{if(it.r>p.ate||it.up>0)return true;n++;if(p.modo==='vender'){S.sal+=it.val;g+=it.val}else{const s=valSuc(it);S.suc+=s;g+=s}return false});
  return n?`${n} ${n===1?'objeto':'objetos'} ${p.modo==='vender'?(n===1?'vendido':'vendidos'):(n===1?'desmontado':'desmontados')}: +${g} ${p.modo==='vender'?'sal':'sucata'}.`:'';
}
function regraLixo(i){const p=parRar(i);if(!p)return '';S.lixo=p.ate<0?null:p;return p.ate<0?'Limpeza automática desligada.':`A partir de agora ${p.modo==='vender'?'vendes':'desmontas'} sozinho o que apanhares até ${RAR[p.ate]}.`}
/** Várias saídas seguidas na mesma zona, até acabar a energia ou o número pedido. Devolve um resumo em vez de cada luta. */
function variasSaidas(z,n){
  const Z=ZONAS[z]; n=Math.min(200,Math.floor(Number(n))||0);
  if(!Z||S.exp||z>S.zc||n<1||S.en<EN_ZONA)return null;
  let v=0,d=0,sal=0,xp=0,suc=0,cheia=0,rN=0,rSal=0,rSuc=0; const fim=[],itens=[];
  while(n-->0&&S.en>=EN_ZONA){
    if(S.en>=maxEn())S.tE=agora(); S.en-=EN_ZONA;
    const elite=Math.random()<.1, L=Z.base+RI(0,2), res=simular(eu(),inimigo((elite?'Alfa ':'')+Z.ini[RI(0,2)],L,(elite?1.5:1)*Z.f));
    if(!res.ganhou){d++;continue}
    v++;S.vit++;if(z===S.zc)S.zw=Math.min(bossN(z),(S.zw||0)+1);
    const s=Math.round((5+L*4)*(elite?2:1)*Z.f*R(.8,1.2)*(1+bSal()/100)), x=Math.round((12+L*6)*(elite?2:1)*Z.f*(1+bXp()/100)), sc=Math.random()<.5?RI(1,2+Math.floor(L/3)):0;
    sal+=s;S.sal+=s;suc+=sc;S.suc+=sc;xp+=x;
    if(elite||Math.random()<.35){const it=gerarItem(L),rc=recicla(it);if(rc){rN++;rSal+=rc[0];rSuc+=rc[1]}else if(S.inv.length<20){S.inv.push(it);itens.push(it)}else cheia++}
    ganhaXp(x,fim);
  }
  const l=[{c:'f',m:`${v+d} ${v+d===1?'saída':'saídas'} em ${Z.n}: ${v} ${v===1?'vitória':'vitórias'}${d?` e ${d} ${d===1?'derrota':'derrotas'}`:''}.`},{c:'t',m:`+${xp} XP, +${sal} sal, +${suc} sucata.`}];
  for(const it of itens)l.push({c:'p',m:`Encontraste: ${it.nome} (${RAR[it.r]}).`});
  if(rN)l.push({c:'t',m:`${rN} ${rN===1?'objeto reciclado':'objetos reciclados'}: ${rSal?'+'+rSal+' sal':''}${rSuc?'+'+rSuc+' sucata':''}.`});
  if(cheia)l.push({c:'e',m:`A mochila encheu: ${cheia} ${cheia===1?'objeto ficou':'objetos ficaram'} para trás.`});
  return [{n:S.nome,max:1},{n:Z.n,max:1},l.concat(fim),Z.a];
}
const custoAtrN=(k,n)=>{let t=0;for(let j=0;j<n;j++)t+=Math.round(15*Math.pow(1.12,S.attr[k]-3+j));return t};
/** Treina "atributo:quantos". Compra até esse número de pontos, parando quando o sal acaba. Devolve quantos comprou. */
function treinar(i){
  const [k,q]=String(i).split(':'); let n=Math.min(500,Math.max(1,Math.floor(Number(q))||1)), f=0;
  if(!Object.hasOwn(ATR,k))return 0;
  while(n-->0&&S.sal>=custoAtr(k)){S.sal-=custoAtr(k);S.attr[k]++;f++}
  return f;
}
const EXP={sal:['sal',()=>60+S.nv*25],xp:['XP',()=>Math.max(40+S.nv*20,Math.round(xpNec()*.015))],suc:['sucata',()=>6+S.nv]}, HORA=3600000;
const ganhoExp=(tp,h)=>Math.round(EXP[tp][1]()*h*(tp==='sal'?1+bSal()/100:tp==='xp'?1+bXp()/100:1));
function fechaExp(h){
  const e=S.exp; S.exp=null;
  if(h<1)return 'Voltaste antes da primeira hora: a expedição não rendeu nada.';
  const g=ganhoExp(e.tipo,h), ex=[];
  if(e.tipo==='sal')S.sal+=g; else if(e.tipo==='suc')S.suc+=g; else ganhaXp(g,ex);
  return `Expedição de ${h} h concluída: +${g} de ${EXP[e.tipo][0]}.`+ex.map(x=>' '+x.m).join('');
}
function partir(i){
  const [tp,h]=String(i).split(':'), n=Math.floor(Number(h));
  if(S.exp||!Object.hasOwn(EXP,tp)||!(n>=1&&n<=10))return '';
  S.exp={tipo:tp,h:n,ini:agora(),fim:agora()+n*HORA};
  return `O faroleiro partiu em expedição por ${n} h.`;
}
const voltar=()=>S.exp?fechaExp(Math.min(S.exp.h,Math.floor((agora()-S.exp.ini)/HORA))):'';
function explorar(z){
  const Z=ZONAS[z]; if(!Z||S.en<EN_ZONA||z>S.zc)return null;
  gastaEnergia(EN_ZONA);
  const elite=Math.random()<.1, L=Z.base+RI(0,2), a=eu();
  const b=inimigo((elite?'Alfa ':'')+Z.ini[RI(0,2)],L,(elite?1.5:1)*Z.f), res=simular(a,b), fim=[];
  if(res.ganhou){
    const sal=Math.round((5+L*4)*(elite?2:1)*Z.f*R(.8,1.2)*(1+bSal()/100)), xp=Math.round((12+L*6)*(elite?2:1)*Z.f*(1+bXp()/100)), suc=Math.random()<.5?RI(1,2+Math.floor(L/3)):0;
    S.sal+=sal;S.suc+=suc;S.vit++;if(z===S.zc)S.zw=Math.min(bossN(z),(S.zw||0)+1);
    fim.push({c:'f',m:`Vitória! +${xp} XP, +${sal} sal${suc?`, +${suc} sucata`:''}.`});
    if(elite||Math.random()<.35){const it=gerarItem(L),rc=recicla(it);if(rc)fim.push({c:'t',m:txtRec(it,rc)});else if(S.inv.length<20){S.inv.push(it);fim.push({c:'p',m:`Encontraste: ${it.nome} (${RAR[it.r]}).`})}else fim.push({c:'e',m:'Havia um objeto, mas a mochila está cheia.'})}
    ganhaXp(xp,fim);
  }else fim.push({c:'f',m:'Derrota. Arrastas-te de volta ao farol.'});
  return cena(a,b,res.reg.concat(fim),Z.a);
}
function prova(){
  const P=proxProva(); if(!P||S.nv<P.nv||S.en<P.en)return null;
  gastaEnergia(P.en);
  const a=eu(), b=inimigo(P.boss,P.L,P.k), res=simular(a,b), fim=[];
  if(res.ganhou){S.prom=(+S.prom||0)+1;fim.push({c:'f',m:`Prova superada! És agora ${titulo()}.`},{c:'p',m:poder()})}
  else fim.push({c:'f',m:`O ${P.boss} não cede. Volta mais forte.`});
  return cena(a,b,res.reg.concat(fim),S.classe);
}
function arena(k,rival){
  let o=null; k=String(k);
  if(k[0]==='r')o=rival||null;
  else{const s=SIMULADOS[+k.slice(2)];if(s){const L=Math.max(1,Math.round(s[1]/45));o=Object.assign(inimigo(s[0],L,1.25),{p:s[1],nv:L})}}
  if(S.bil<1||!o)return null;
  if(S.bil>=5)S.tB=agora(); S.bil--;
  const a=eu();
  const b={n:'Fantasma de '+o.n,max:o.max,dano:o.dano,tipo:o.tipo,af:o.af,am:o.am,crit:o.crit,duplo:o.duplo||0,esq:o.esq,agi:o.agi,refl:o.refl||0,roubo:o.roubo||0,hp:0}, res=simular(a,b), fim=[];
  if(res.ganhou){const g=Math.max(8,Math.min(60,Math.round(18+(o.p-S.pontos)/12))), sal=Math.round((20+o.nv*6)*(1+bSal()/100));S.pontos+=g;S.sal+=sal;fim.push({c:'f',m:`Vitória na arena! +${g} pontos, +${sal} sal.`})}
  else{const p=Math.min(S.pontos,10);S.pontos-=p;fim.push({c:'f',m:`Derrota na arena. −${p} pontos.`})}
  return cena(a,b,res.reg.concat(fim),'serpente');
}
function usarCodigo(c){
  if(!c)return 'Esse código não existe.';
  S.usados=S.usados||[];
  if(!c.reutilizavel&&S.usados.includes(c.codigo))return 'Já usaste esse código.';
  S.sal+=Math.max(0,c.sal|0); S.suc+=Math.max(0,c.sucata|0);
  if(c.niveis>0){S.nv=Math.min(NV_MAX,S.nv+(c.niveis|0));S.xp=0}
  if(c.energia)S.en=Math.max(S.en,maxEn());
  if(c.bilhetes)S.bil=5;
  if(c.obra&&(S.obra||S.exp||S.choco)){if(S.obra)S.obra.fim=0;if(S.exp)S.exp.fim=0;if(S.choco)S.choco.fim=0;recuperar()}
  if(c.epico&&S.inv.length<20)S.inv.push(gerarItem(S.nv,3));
  if(!c.reutilizavel)S.usados.push(c.codigo);
  return `Código aceite: ${c.descricao}.`;
}
const tem=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);

/** Aplica uma ação do jogador ao estado. Tudo o que o jogador pode fazer passa por aqui e é validado aqui. */
function aplicar(a,i,ctx={}){
  let aviso=recuperar()||'', luta=null;
  if(a==='reset'){S=novo();return{aviso:'Jogo recomeçado.',luta}}
  if(a==='classe'){if(tem(CLASSES,i)&&!S.classe){S.classe=i;aviso=`És agora ${CLASSES[i].n}.`}}
  else if(a==='nome'){const v=String(i??'').trim().slice(0,16);if(v)S.nome=v}
  else if(S.classe){
    stock();
    if(a==='partir')aviso=partir(i)||aviso;
    else if(a==='voltar')aviso=voltar()||aviso;
    else if(a==='expn'){const [z,n]=String(i).split(':'),r=variasSaidas(Number(z),n);if(r)luta=cena(...r)}
    else if(a==='boss'){const r=boss();if(r)luta=cena(...r)}
    else if(S.exp&&(a==='exp'||a==='prova'||a==='arena'))aviso='O faroleiro está em expedição.';
    else if(a==='exp')luta=explorar(Number(i));
    else if(a==='prova')luta=prova();
    else if(a==='arena')luta=arena(i,ctx.rival);
    else if(a==='comprar'){const k=S.loja.it.findIndex(x=>x.id==i),it=S.loja.it[k];if(it&&S.sal>=it.preco&&S.inv.length<20){S.sal-=it.preco;S.loja.it.splice(k,1);delete it.preco;S.inv.push(it);aviso=`Compraste ${it.nome}.`}}
    else if(a==='renovar'){if(S.sal>=custoRenovar()){S.sal-=custoRenovar();stock(true)}}
    else if(a==='chocar')aviso=chocar(i)||aviso;
    else if(a==='pet')aviso=levarPet(i)||aviso;
    else if(a==='limpar')aviso=limparMochila(i)||aviso;
    else if(a==='lixo')aviso=regraLixo(i)||aviso;
    else if(a==='attr')treinar(i);
    else if(a==='melhorar')aviso=melhorar(i)||aviso;
    else if(a==='trocar')aviso=trocarBonus(i)||aviso;
    else if(a==='equipar'){const k=S.inv.findIndex(x=>x.id==i);if(k>=0){const it=S.inv.splice(k,1)[0];if(S.eq[it.slot])S.inv.push(S.eq[it.slot]);S.eq[it.slot]=it}}
    else if(a==='tirar'){if(tem(SLOT,i)&&S.eq[i]){if(S.inv.length<20){S.inv.push(S.eq[i]);S.eq[i]=null}else aviso='A mochila está cheia. Vende ou desmonta um objeto primeiro.'}}
    else if(a==='vender'||a==='desmontar'){const k=S.inv.findIndex(x=>x.id==i);if(k>=0){const it=S.inv.splice(k,1)[0];if(a==='vender'){S.sal+=it.val;aviso=`Vendido por ${it.val} sal.`}else{const s=Math.ceil((1+it.nv/2)*MULT[it.r]);S.suc+=s;aviso=`Desmontado: +${s} sucata.`}}}
    else if(a==='obra'){if(tem(EDIF,i)){const c=custoEd(i);if(!S.obra&&S.sal>=c.sal&&S.suc>=c.suc&&podeSubir(i)){S.sal-=c.sal;S.suc-=c.suc;S.obra={k:i,fim:agora()+tempoObra(i)};aviso=`Obra iniciada: ${EDIF[i].n}.`}}}
    else if(a==='codigo')aviso=usarCodigo(ctx.codigo);
  }
  S.t=agora();
  return{aviso,luta};
}
function usar(e){S=e;return S}
const estado=()=>S;
function relogio(f){agora=f}

export {SUC_MS,SAL_MS,BIL_MS,ZONAS,EDIF,RAR,MULT,NOMES,SUF,SLOT,ATR,ROT,RAR_NV,NV_MAX,CLASSES,ESQ_MAX,ESQ_SNIPER,PROVAS,proxProva,titulo,poder,grau,LOJA_MS,SIMULADOS,
  novo,esc,lim,normalizar,prom,maxHp,atk,tipo,armF,armM,duplo,roubo,refl,bXp,bSal,combate,crit,esq,maxEn,enSeg,enMs,custoAtr,xpNec,custo,custoEd,podeSubir,tempoObra,fmtT,
  EXP,ganhoExp,valSuc,bossN,EN_ZONA,PETS,petB,custoPet,treinar,custoAtrN,eqSoma,A,base,nomeItem,descBonus,custoUp,custoTroca,chanceUp,perfil,limpar,recuperar,descItem,custoRenovar,aplicar,usar,estado,relogio};
