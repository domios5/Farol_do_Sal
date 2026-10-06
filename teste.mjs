// Simula o servidor em memória: 3 jogadores a fazer milhares de ações através das mesmas regras.
import * as R from './docs/online/regras.js';
if (!R.RAR) throw new Error('regras');
let t = Date.now(); R.relogio(() => t);
const bd = new Map();
const CODIGOS = { SAL1000: { codigo: 'SAL1000', descricao: 'x', sal: 1000, reutilizavel: true }, BEMVINDO: { codigo: 'BEMVINDO', descricao: 'y', sal: 200, sucata: 30 },
  OBRAFEITA: { codigo: 'OBRAFEITA', descricao: 'z', obra: true, reutilizavel: true }, EPICO: { codigo: 'EPICO', descricao: 'e', epico: true, reutilizavel: true }, SUCATA500:{codigo:'SUCATA500',descricao:'s',sucata:500,reutilizavel:true} };
function pedido(uid, acao, arg) {
  const linha = bd.get(uid);
  R.usar(linha ? R.normalizar(JSON.parse(linha.estado)) : R.novo());
  const ctx = {};
  if (acao === 'arena' && String(arg).startsWith('r:')) { const o = bd.get(arg.slice(2)); if (o) ctx.rival = R.limpar(arg.slice(2), JSON.parse(o.perfil)); }
  if (acao === 'codigo') ctx.codigo = CODIGOS[String(arg).toUpperCase()] ?? null;
  const r = R.aplicar(acao, arg, ctx), S = R.estado();
  bd.set(uid, { estado: JSON.stringify(S), perfil: JSON.stringify(R.perfil()) });
  return { S, ...r };
}
const ok = (c, m) => { if (!c) { console.error('FALHOU:', m); process.exitCode = 1; } };
const rnd = a => a[Math.floor(Math.random() * a.length)];
// Jogador "a sério": treina sobretudo o atributo da classe, depois vida e sorte, e leva sempre a mascote de dano.
const PESOS = { escudo: { for: 45, res: 35, sor: 15, agi: 5 }, mago: { int: 50, res: 30, sor: 15, agi: 5 }, sniper: { agi: 50, res: 30, sor: 15, for: 5 } };
function treino(u) { const S = R.estado(), w = PESOS[S.classe]; if (!w) return; pedido(u, 'attr', Object.keys(w).sort((a, b) => S.attr[a] / w[a] - S.attr[b] / w[b])[0] + ':3'); }
const tent = {}, chefes = [];
const bt = [], bv = [], nvz = []; let lote = 0; let pets = 0, maxUp = 0, falhas = 0; const rar = [], evita = {}, zt = [], zv = [], PASSOS = +process.argv[2] || 6000;
const classes = ['escudo', 'mago', 'sniper']; let lutas = 0, vit = 0, arenas = 0;
['a', 'b', 'c'].forEach((u, n) => {
  ok(pedido(u, 'exp', 0).luta == null, 'não explora sem classe');
  pedido(u, 'classe', classes[n]); ok(pedido(u, 'classe', 'mago').S.classe === classes[n], 'classe não muda');
  ok(pedido(u, 'codigo', 'BEMVINDO').aviso.startsWith('Código aceite'), 'código aceite');
  ok(pedido(u, 'codigo', 'BEMVINDO').aviso === 'Já usaste esse código.', 'código de uso único');
  ok(pedido(u, 'codigo', 'NAOEXISTE').aviso === 'Esse código não existe.', 'código inválido');
});
for (let passo = 0; passo < PASSOS; passo++) {
  const u = rnd(['a', 'b', 'c']); t += 30000;
  let { S } = pedido(u, 'estado');
  const zs = R.ZONAS.map((z, i) => i).filter(i => i <= S.zc);
  const z = Math.max(0, zs.length - 1 - (evita[u] > passo ? 1 : 0)); zt[z] = (zt[z] || 0) + 1;
  const r = pedido(u, 'exp', z); if (r.luta && !r.luta.linhas.some(l => /Vitória/.test(l.m))) evita[u] = passo + 40; else if (r.luta) zv[z] = (zv[z] || 0) + 1;
  if (r.luta) { lutas++; if (/Vitória/.test(r.luta.linhas.at(-1).m) || r.luta.linhas.some(l => /Vitória/.test(l.m))) vit++; }
  S = r.S;
  for (const it of [...S.inv]) { const e = S.eq[it.slot]; pedido(u, !e || (it.val > e.val) ? 'equipar' : rnd(['vender', 'desmontar']), it.id); }
  treino(u);
  if (passo % 13 === 0) { const a0 = pedido(u, 'estado').S, k = rnd(Object.keys(R.ATR)), q = rnd([10, 37, 9999, -4, 'x']), a1 = pedido(u, 'attr', k + ':' + q).S, d = a1.attr[k] - a0.attr[k];
    ok(d >= 0 && d <= 500 && (typeof q !== 'number' || q < 1 || d <= q) && a1.sal >= 0 && a1.sal <= a0.sal + 500, `treino em lote ${k}:${q} deu ${d}`); }
  pedido(u, 'obra', rnd(Object.keys(R.EDIF)));
  { const e = Object.values(R.estado().eq).filter(Boolean), it = rnd(e); if (it) { pedido(u, passo % 9 ? 'melhorar' : 'trocar', it.id); if (passo % 500 === 0) pedido(u, 'melhorar', 'naoexiste'); } }
  if (passo % 7 === 0) { const l = R.estado().loja.it[0]; if (l) pedido(u, 'comprar', l.id); }
  if (passo % 11 === 0) { const a = pedido(u, 'arena', Math.random() < .5 ? 'r:' + rnd(['a', 'b', 'c'].filter(x => x !== u)) : 's:' + Math.floor(Math.random() * 9)); if (a.luta) arenas++; }
  if (passo % 50 === 0) pedido(u, 'prova');
  if (passo % 300 === 0) { const s0 = pedido(u, 'estado').S, forj = s0.inv.filter(i => i.up > 0).length, r = pedido(u, 'limpar', rnd(['vender', 'desmontar']) + ':' + rnd([0, 2, 6]));
    ok(r.S.inv.filter(i => i.up > 0).length === forj && r.S.inv.length <= s0.inv.length && r.S.sal >= s0.sal && r.S.suc >= s0.suc, 'limpeza por raridade poupa os forjados e paga');
    for (const x of ['roubar:3', 'vender:9', 'vender:-5', 'vender', null, '__proto__:1']) { ok(pedido(u, 'limpar', x).S.inv.length === r.S.inv.length, 'limpeza inválida ' + x); pedido(u, 'lixo', x); }
    ok(pedido(u, 'lixo', 'desmontar:2').S.lixo.ate === 2, 'regra automática guardada'); const e = pedido(u, 'expn', z + ':50');
    ok(e.S.inv.every(i => i.r > 2 || s0.inv.some(j => j.id === i.id) || r.S.inv.some(j => j.id === i.id)), 'regra automática não deixa entrar o que devia reciclar');
    ok(pedido(u, 'lixo', 'vender:-1').S.lixo === null, 'regra automática desligada'); }
  { const zc0 = R.estado().zc, b = pedido(u, 'boss'); if (b.luta) { bt[zc0] = (bt[zc0] || 0) + 1; tent[u + zc0] = (tent[u + zc0] || 0) + 1; if (b.S.zc > zc0) { bv[zc0] = 1; (nvz[zc0] = nvz[zc0] || []).push(b.S.nv); chefes.push([b.S.classe, zc0 + 1, passo, tent[u + zc0], b.S.nv]); } ok(b.S.zc > zc0 || b.S.zw === R.bossN(zc0) - Math.ceil(R.bossN(zc0) * .05), 'derrota no chefe tira 5% das vitórias'); } else ok(b.S.zc === zc0, 'chefe sem requisitos não avança'); }
  ok(pedido(u, 'exp', R.estado().zc + 1).luta == null && pedido(u, 'expn', (R.estado().zc + 1) + ':10').luta == null, 'zona trancada não se explora');
  { const e0 = R.estado().en, q = rnd([10, 200, 99999, -3, 'x']), r = pedido(u, 'expn', z + ':' + q); if (r.luta) { const m = /^(\d+) saída/.exec(r.luta.linhas[0].m); ok(m && +m[1] >= 1 && +m[1] <= Math.min(200, q) && r.S.en >= 0, 'saídas em lote dentro dos limites: ' + r.luta.linhas[0].m); lote += +m[1]; } }
  if (passo % 5 === 0) { const e = R.estado(); pedido(u, 'chocar', (e.pets.dano || 0) < e.ed.incubadora ? 'dano' : 'vida'); pedido(u, 'pet', 'dano'); if (passo % 500 === 0) { pedido(u, 'chocar', '__proto__'); pedido(u, 'chocar', 'dragao'); pedido(u, 'pet', 'constructor'); } }
  if (passo % 97 === 0) { const sal0 = pedido(u, 'estado').S.sal; ok(pedido(u, 'partir', 'sal:3').S.exp, 'parte em expedição');
    ok(pedido(u, 'exp', 0).luta == null && pedido(u, 'arena', 's:0').luta == null, 'sem lutas durante a expedição');
    ok(pedido(u, 'partir', 'xp:99').S.exp.h === 3, 'não parte duas vezes'); t += 2 * 3600000 + 5000;
    const v = pedido(u, 'voltar'); ok(!v.S.exp && /de 2 h/.test(v.aviso) && v.S.sal > sal0, 'regresso antecipado paga 2 h: ' + v.aviso);
    pedido(u, 'partir', 'suc:1'); t += 3600000; ok(/Expedição de 1 h/.test(pedido(u, 'estado').aviso), 'expedição fecha sozinha');
    for (const x of ['sal:0', 'sal:11', 'ouro:5', 'sal', null, '__proto__:3']) ok(!pedido(u, 'partir', x).S.exp, 'partida inválida ' + x); }
  S = pedido(u, 'estado').S;
  ok(S.sal >= 0 && S.suc >= 0 && S.en >= 0 && S.en <= R.maxEn(), 'recursos válidos');
  ok(S.ed.incubadora * 10 <= S.nv && Object.keys(S.pets).every(k => R.PETS[k] && S.pets[k] <= S.ed.incubadora) && (!S.pet || S.pets[S.pet] > 0), 'mascotes dentro dos limites'); pets = Math.max(pets, ...Object.values(S.pets), 0);
  ok(S.inv.length <= 20 && S.nv <= 100, 'mochila ≤ 20 e nível ≤ 100');
  for (const it of [...S.inv, ...Object.values(S.eq).filter(Boolean)]) { ok(R.RAR_NV[it.r] <= S.nv, 'raridade libertada pelo nível'); ok((it.up || 0) <= 10, 'forja ≤ +10'); ok(!it.rv && !it.rf && it.b.every(e => e[0] !== 'rv' && e[0] !== 'rf'), 'sem roubo/refletir no equipamento'); falhas += it.fz || 0; ok(it.b.length === [1, 1, 1, 1, 2, 2, 3][it.r], 'número de bónus por raridade'); rar[it.r] = (rar[it.r] || 0) + 1; if (it.up > maxUp) maxUp = it.up; }
  ok(Object.keys(R.EDIF).every(k => k === 'farol' || S.ed[k] <= S.ed.farol) && S.ed.farol <= 10, 'farol limita construções');
  ok(R.esq() <= [25, 30, 35][R.grau('sniper')] && R.crit() <= 25 && R.duplo() <= (R.grau('sniper') >= 2 ? 30 : 20) + 20 && R.roubo() <= 30 && R.refl() <= 50, 'tetos de esquiva, crítico e duplo');
  ok(Number.isFinite(R.atk()) && Number.isFinite(R.maxHp()), 'estatísticas finitas');
}
// objetos antigos com roubo/refletir são limpos e mantêm o número de bónus
{ const v = R.normalizar({ inv: [{ id: 1, slot: 'arma', r: 5, nv: 30, atk: 9, val: 9, rv: 4, b: [['rv', 5], ['for', 3]] }] }).inv[0]; ok(!v.rv && v.b.length === 2 && v.b.every(e => e[0] !== 'rv'), 'limpeza de objetos antigos'); }
ok(falhas > 0, 'a forja falha às vezes');
// tentativas de batota: argumentos inválidos não podem rebentar nem dar nada
const antes = JSON.stringify(pedido('a', 'estado').S.attr);
for (const [a, i] of [['attr', '__proto__'], ['attr', 'constructor'], ['obra', 'toString'], ['tirar', '__proto__'], ['exp', 99], ['exp', -1], ['exp', 'x'], ['comprar', 'zzz'], ['equipar', null], ['arena', 'r:naoexiste'], ['arena', 's:99'], ['arena', {}], ['nome', { a: 1 }], ['classe', 'deus'], ['inventada', 1]]) pedido('a', a, i);
ok(JSON.stringify(pedido('a', 'estado').S.attr) === antes, 'argumentos inválidos não mudam atributos');
ok(pedido('a', 'nome', '  <b>Zé</b> com um nome enorme  ').S.nome.length <= 16, 'nome cortado a 16');
const fim = ['a', 'b', 'c'].map(u => { const S = pedido(u, 'estado').S; return `${S.classe} nv ${S.nv} grau ${S.prom}, farol ${S.ed.farol}, ${S.pontos} pts`; });
console.log(`${lutas} saídas (${vit} vitórias), ${arenas} lutas de arena\n` + fim.join('\n'));
console.log('Objetos vistos por raridade: ' + [0,1,2,3,4,5,6].map(r => R.RAR[r] + ' ' + (rar[r] || 0)).join(', ') + ' · maior forja +' + maxUp + ' · mascote mais evoluída: versão ' + pets);
console.log('Tentativas até vencer cada chefe (soma dos 3 jogadores): ' + R.ZONAS.map((z, i) => `${i + 1}:${bt[i] || 0}`).join(' '));
if (process.env.CH) for (const c of chefes) console.log('CH', ...c);
console.log('Nível ao vencer cada chefe: ' + R.ZONAS.map((z, i) => `${i + 1}:${(nvz[i] || []).join('/') || '-'}`).join(' '));
console.log('Saídas em lote: ' + lote + ' · zona de fronteira no fim: ' + ['a', 'b', 'c'].map(u => pedido(u, 'estado').S.zc + 1 + ' (' + pedido(u, 'estado').S.zw + ' vitórias)').join(', '));
console.log('Vitórias por zona: ' + zt.map((n, i) => `${i + 1}:${Math.round(100 * (zv[i] || 0) / n)}%(${n})`).join(' '));
console.log(process.exitCode ? 'HÁ FALHAS' : 'Tudo certo.');
