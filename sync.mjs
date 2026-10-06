import { copyFileSync } from 'node:fs';
copyFileSync('docs/online/regras.js', 'supabase/functions/jogo/regras.js');
console.log('regras.js copiado para o servidor.');
