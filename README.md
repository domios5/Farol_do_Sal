# Farol de Sal

Este repositório tem duas versões do jogo, as duas prontas para o GitHub Pages:

| Endereço | Versão | Precisa de |
|---|---|---|
| `https://UTILIZADOR.github.io/REPOSITORIO/` | **Local**: um só ficheiro (`docs/index.html`). Cada pessoa joga sozinha e o progresso fica no browser dela. | Nada |
| `https://UTILIZADOR.github.io/REPOSITORIO/online/` | **Com servidor**: combates, arena entre amigos e códigos decididos no servidor. | Um projeto Supabase (passos mais abaixo) |

## Pôr no GitHub

1. Em github.com, cria um repositório novo (público, para o GitHub Pages ser gratuito).
2. Na página do repositório, escolhe **uploading an existing file** e arrasta **o conteúdo** desta pasta (não a pasta em si), incluindo a pasta `docs`. Confirma com **Commit changes**.
3. Vai a **Settings → Pages**. Em **Build and deployment**, escolhe **Deploy from a branch**, ramo `main`, pasta `/docs`, e guarda.
4. Passado um ou dois minutos, o endereço aparece no topo dessa página. A versão local fica logo a funcionar.

A versão com servidor só funciona depois de fazeres os passos de "Pôr o servidor a funcionar" e de voltares a enviar o `docs/online/config.js` preenchido.

---

# Versão com servidor

O jogo deixa de fazer contas no telemóvel. A app só diz ao servidor o que o jogador quer fazer
("explorar a zona 2", "comprar este objeto") e o servidor decide o resultado, guarda-o e devolve-o.
Combates, loot, energia, obras e códigos de bónus ficam fora do alcance de quem quiser fazer batota.

## O que está aqui

| Pasta / ficheiro | O que é |
|---|---|
| `docs/online/` | A app: `index.html`, `ui.js` (ecrãs) e `regras.js` (regras, partilhadas com o servidor) |
| `docs/online/config.js` | Onde pões o endereço e a chave pública do teu projeto Supabase |
| `supabase/migrations/0001_init.sql` | Tabelas `jogadores` e `codigos`, com os códigos de teste |
| `supabase/functions/jogo/` | A função de servidor que aplica as regras |
| `teste.mjs` | Simula 3 jogadores e 6000 rondas contra as regras (`npm run teste`) |
| `capacitor.config.json` | Configuração para gerar a app Android |

## Pôr o servidor a funcionar (uma vez)

Precisas de Node.js instalado no computador.

1. Cria uma conta em supabase.com e um projeto novo (o plano gratuito chega). Guarda a palavra-passe da base de dados.
2. No painel, em **Authentication → Sign In / Providers**, ativa **Allow anonymous sign-ins**.
   Cada telemóvel passa a ter a sua conta sem ninguém ter de se registar.
3. Em **SQL Editor**, cola o conteúdo de `supabase/migrations/0001_init.sql` e carrega em **Run**.
4. Numa linha de comandos, dentro desta pasta:
   ```
   npm install
   npx supabase login
   npx supabase link --project-ref O_TEU_REF
   npm run servidor
   ```
   O `O_TEU_REF` é o código que aparece no endereço do painel (`supabase.com/dashboard/project/O_TEU_REF`).
5. Em **Project Settings → API**, copia o **Project URL** e a chave **anon public** para `docs/online/config.js`.
   Nunca ponhas a chave `service_role` na app.

## Experimentar no computador

```
npm run web
```
Abre o endereço que aparecer (versão local) ou esse endereço seguido de `/online/` (versão com servidor). Deves ver o ecrã de escolha de ofício.

## Gerar a app Android

Precisas do Android Studio.

```
npx cap add android     (só da primeira vez)
npm run android
```
No Android Studio: **Build → Generate Signed App Bundle** produz o `.aab` que se envia para a Play Console.

## Códigos de bónus

Estão na tabela `codigos`. Os de teste são: `SAL1000`, `SUCATA500`, `ENERGIA`, `BILHETES`, `NIVEL5`,
`OBRAFEITA` (termina a obra, a expedição e a incubação), `EPICO` (repetíveis) e `BEMVINDO` (uma vez por jogador).
Para criar um novo, acrescenta uma linha na tabela pelo painel (**Table Editor**); o código tem de estar em maiúsculas.
Antes de dares o jogo a mais gente, desliga os de teste: `update public.codigos set ativo = false where reutilizavel;`

## Mudar regras

Edita `docs/online/regras.js` e corre `npm run teste` e depois `npm run servidor`
(copia as regras para o servidor e publica a função). Se só mudares `ui.js` ou `index.html`, não precisas de publicar nada no servidor.

## Limites conhecidos

- A conta anónima vive no telemóvel: quem desinstalar a app perde o progresso. O passo seguinte é ligar a conta a um email ou ao Google.
- A app precisa de internet para tudo, incluindo para carregar a biblioteca do Supabase.
- Não há limite de pedidos por jogador além do que o Supabase aplica.
- O progresso da versão que corre dentro do Claude não passa para aqui: são dois jogos separados.
