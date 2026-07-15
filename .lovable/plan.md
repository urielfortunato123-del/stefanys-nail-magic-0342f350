Este é um escopo muito grande — envolve correções de envio de imagem, upload com Supabase Storage, um assistente virtual completo com múltiplos fluxos, painel administrativo, banco de dados e testes multiplataforma. Vou dividir em fases entregáveis para não quebrar o app.

## Fase 1 — Envio da foto do modelo (Web Share API)
- Refatorar o botão "Quero esta unha" em `src/routes/inspiracoes.tsx`.
- Adicionar modal de confirmação com: imagem grande, nome, categoria, formato, cor principal, campo de observações e botão "Enviar modelo para Stefany".
- Implementar `compartilharModelo()`: baixa a imagem como Blob → File → `navigator.share({ files })`.
- Fallback: `wa.me` com mensagem + URL pública da imagem (Cloudinary já é HTTPS público, ok).
- Aviso "Escolha o WhatsApp na próxima tela" com opção "Não mostrar novamente" (localStorage).

## Fase 2 — Upload de foto de referência da cliente
- Ativar Lovable Cloud (necessário para Supabase Storage).
- Criar bucket `referencias-clientes` (privado) + política RLS.
- No fluxo de agendamento (`src/routes/agendar.tsx`), adicionar componente de upload com:
  - Prévia, trocar/remover, barra de progresso, compressão client-side.
  - Upload para `referencias-clientes/{ano}/{mes}/{uuid}.ext`.
  - Gera URL assinada (validade longa) e salva no estado do booking.
  - Bloqueia botão do WhatsApp até terminar o upload.
  - Checkbox de consentimento de privacidade.
- Atualizar `src/lib/whatsapp.ts` para incluir o link assinado da foto.

## Fase 3 — Assistente Virtual "Stefany"
- Botão flutuante persistente (FAB) com painel de chat.
- Menu inicial com botões rápidos.
- Fluxos guiados (respostas prontas):
  - Cuidados com unha em gel
  - Como durar mais
  - Hidratação de cutícula
  - Unha quebrou (com upload de foto)
  - Preciso de manutenção
  - Escolher modelo (perguntas → filtra galeria → mostra 3 sugestões)
  - Fluxo de agendamento completo dentro do chat
  - FAQ (todas as ~20 perguntas)
  - Falar com Stefany (envia resumo formatado)
- Sessão em memória + localStorage.
- Indicador de digitação, botões grandes, acessível.

## Fase 4 — Banco de dados e painel administrativo
- Tabelas: `chatbot_questions`, `chatbot_answers`, `nail_models`, `customer_reference_images`, `whatsapp_clicks`, `chatbot_sessions`.
- Migrar galeria estática de `src/data/gallery.ts` para `nail_models` no banco.
- Painel `/admin` protegido por auth (role admin):
  - CRUD de perguntas/respostas
  - CRUD de modelos
  - Config: telefone WhatsApp, mensagem inicial, prazo de manutenção
  - Métricas: cliques, modelos mais escolhidos, fotos enviadas
  - Exclusão de fotos antigas
- Autenticação Supabase + tabela `user_roles` com `has_role()`.

## Fase 5 — Polimento e testes
- Tratamento de erros (upload, formato, sem internet, WhatsApp não instalado).
- Testes manuais: Android/iOS/Desktop, câmera, galeria, JPG/PNG/HEIC, PWA.

## Decisões que preciso confirmar antes de começar

1. **Escopo desta iteração**: Fazer todas as 5 fases é um projeto grande (várias horas de trabalho, muitos arquivos). Recomendo começar por **Fase 1 + Fase 2** (correção do envio de imagem — o problema mais urgente que você mencionou) e entregar as outras em iterações seguintes. Você prefere:
   - (a) Só Fase 1+2 agora, e depois pedir o assistente e o admin.
   - (b) Fase 1+2+3 (envio + assistente completo, sem admin/DB — chatbot com conteúdo hardcoded).
   - (c) Tudo, aceitando que vai levar várias mensagens e trocar bastante do app.

2. **Bucket privado ou público?** Você pediu preferencialmente privado com URL assinada. Confirma? (Privado é mais seguro; URL assinada com validade de 30 dias basta para a Stefany abrir no WhatsApp.)

3. **Login para o painel admin**: precisa habilitar autenticação (email/senha da Stefany). Ok?

Me diga qual escopo (a/b/c) e confirmo bucket privado + auth, aí começo pela Fase 1.