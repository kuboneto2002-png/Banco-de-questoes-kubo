# Residência Tracker — versão pessoal 1.0

Aplicativo PWA para organização de estudos de residência médica (ciclo 2027), com meta diária de 4 horas líquidas e preparação para SCMRP/USP-RP.

## O que está incluído
- Dashboard com horas do dia, total acumulado, questões e revisões.
- Planner diário para teoria, questões e revisões.
- Cronômetro automático de sessões, com pausa e retomada.
- Registro de desempenho por instituição, área e assunto.
- Banco autoral inicial com **32 questões inéditas**, cinco alternativas, gabarito e comentário.
- Sessão de questões por área e simulado aleatório de 10 questões.
- Registro automático de acertos e erros no desempenho.
- Manifesto e service worker para instalação como PWA.

## Como abrir agora
1. Extraia o arquivo ZIP em um computador.
2. Abra `index.html` em um navegador moderno. A interface e o banco de questões funcionam sem servidor; o modo de instalação PWA exige hospedagem HTTPS ou servidor local.

## Como publicar e instalar no iPhone/iPad
1. Publique o conteúdo desta pasta em um serviço de hospedagem estática com HTTPS (por exemplo, GitHub Pages, Netlify ou Vercel).
2. Acesse o endereço publicado no Safari do iPhone/iPad.
3. Use **Compartilhar → Adicionar à Tela de Início**.

## Dados e privacidade
Esta versão não possui backend, login ou sincronização em nuvem. Sessões, tarefas e desempenho ficam no `localStorage` do navegador/dispositivo. Limpar os dados do navegador pode apagar seu histórico. Para usar em mais de um aparelho ou ter recuperação de dados, é necessário integrar banco de dados e autenticação (por exemplo, Supabase).

## Limites do banco de questões
As 32 questões são autorais e foram organizadas em Clínica Médica, Cirurgia, Pediatria, Ginecologia e Obstetrícia e Preventiva. Foram elaboradas considerando temas e estilo geral observados nos PDFs SCMRP R1 2026 e USP-RP R1 2024 fornecidos; não são questões oficiais nem cópias. O banco ainda é inicial e não permite afirmar incidência histórica robusta. Atualize condutas conforme diretrizes vigentes.

## Estrutura
- `index.html`: interface
- `styles.css`: estilos
- `app.js`: planner, cronômetro e desempenho
- `quiz.js`: fluxo de questões e banco embutido
- `questions.json`: cópia legível/exportável do banco
- `manifest.webmanifest` e `sw.js`: instalação e cache PWA
