// Função de servidor do Farol de Sal. Recebe {acao, arg}, aplica as regras e guarda o resultado.
// A app nunca envia estado: só diz o que o jogador quer fazer.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as R from "./regras.js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ACOES = new Set(["estado", "classe", "nome", "exp", "prova", "arena", "comprar", "renovar", "attr",
  "equipar", "tirar", "vender", "desmontar", "obra", "codigo", "reset", "partir", "voltar", "melhorar", "trocar", "chocar", "pet", "boss", "expn", "limpar", "lixo"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ erro: "metodo" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: quem, error: eAuth } = await admin.auth.getUser(token);
    if (eAuth || !quem?.user) return json({ erro: "sessao" }, 401);
    const uid = quem.user.id;

    const { acao, arg } = await req.json().catch(() => ({}));
    if (!ACOES.has(acao)) return json({ erro: "acao" }, 400);

    const { data: linha, error: eLer } = await admin.from("jogadores").select("estado, versao").eq("id", uid).maybeSingle();
    if (eLer) throw eLer;
    R.usar(linha ? R.normalizar(linha.estado) : R.novo());

    const ctx: Record<string, unknown> = {};
    if (acao === "arena" && typeof arg === "string" && arg.startsWith("r:") && UUID.test(arg.slice(2)) && arg.slice(2) !== uid) {
      const { data } = await admin.from("jogadores").select("id, perfil").eq("id", arg.slice(2)).maybeSingle();
      if (data) ctx.rival = R.limpar(data.id, data.perfil);
    }
    if (acao === "codigo") {
      const c = String(arg ?? "").trim().toUpperCase().slice(0, 20);
      const { data } = await admin.from("codigos").select("*").eq("codigo", c).eq("ativo", true).maybeSingle();
      ctx.codigo = data;
    }

    const r = R.aplicar(acao, arg, ctx);
    const S = R.estado();
    const dados = { estado: S, perfil: R.perfil(), pontos: S.pontos, atualizado: new Date().toISOString() };
    if (linha) {
      const { data: ok, error } = await admin.from("jogadores").update({ ...dados, versao: linha.versao + 1 })
        .eq("id", uid).eq("versao", linha.versao).select("id");
      if (error) throw error;
      if (!ok?.length) return json({ erro: "conflito" }, 409); // outro pedido chegou primeiro
    } else {
      const { error } = await admin.from("jogadores").insert({ id: uid, ...dados });
      if (error) throw error;
    }

    const { data: rivais } = await admin.from("jogadores").select("id, perfil").neq("id", uid)
      .order("pontos", { ascending: false }).limit(50);
    return json({ S, aviso: r.aviso, luta: r.luta, rivais: rivais ?? [], agora: Date.now() });
  } catch (e) {
    console.error(e);
    return json({ erro: "servidor" }, 500);
  }
});
