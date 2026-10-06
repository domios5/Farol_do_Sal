-- Farol de Sal: base de dados.
-- Nenhuma tabela tem políticas de acesso: a app nunca lê nem escreve aqui diretamente.
-- Só a função de servidor "jogo" (com a chave service_role) mexe nos dados.

create table public.jogadores (
  id uuid primary key references auth.users on delete cascade,
  estado jsonb not null,                 -- o jogo completo do jogador
  perfil jsonb not null default '{}',    -- cópia de combate, usada pelos outros na arena
  pontos integer not null default 100,
  versao integer not null default 1,     -- evita que dois pedidos simultâneos se atropelem
  atualizado timestamptz not null default now()
);
create index jogadores_pontos on public.jogadores (pontos desc);
alter table public.jogadores enable row level security;

create table public.codigos (
  codigo text primary key,               -- sempre em maiúsculas
  descricao text not null,
  sal integer not null default 0,
  sucata integer not null default 0,
  niveis integer not null default 0,
  energia boolean not null default false,   -- enche a energia
  bilhetes boolean not null default false,  -- enche os bilhetes da arena
  obra boolean not null default false,      -- termina a obra, a expedição e a incubação em curso
  epico boolean not null default false,     -- dá um objeto épico
  reutilizavel boolean not null default false,
  ativo boolean not null default true
);
alter table public.codigos enable row level security;

-- Códigos de teste. Antes de abrir o jogo a mais gente: update public.codigos set ativo = false;
insert into public.codigos (codigo, descricao, sal, sucata, niveis, energia, bilhetes, obra, epico, reutilizavel) values
  ('SAL1000',   '+1000 de sal',                 1000, 0,   0, false, false, false, false, true),
  ('SUCATA500', '+500 de sucata',               0,    500, 0, false, false, false, false, true),
  ('ENERGIA',   'Energia cheia',                0,    0,   0, true,  false, false, false, true),
  ('BILHETES',  'Bilhetes da arena cheios',     0,    0,   0, false, true,  false, false, true),
  ('NIVEL5',    '+5 níveis',                    0,    0,   5, false, false, false, false, true),
  ('OBRAFEITA', 'Obra, expedição e incubação terminam já', 0,    0,   0, false, false, true,  false, true),
  ('EPICO',     'Um objeto épico do teu nível', 0,    0,   0, false, false, false, true,  true),
  ('BEMVINDO',  'Oferta de boas-vindas',        200,  30,  0, false, false, false, false, false);
