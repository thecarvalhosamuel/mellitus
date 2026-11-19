# Mellitus — Propostas e Escopo de Implementação

> Documento de produto: o que foi proposto, o que entra no MVP, em que ordem será construído e o que fica para depois.
> Detalhes visuais e técnicos: `DESIGN.md` · Resumo para desenvolvimento: `CLAUDE.md`.

---

## 1. Visão

O **Mellitus** é um app mobile para pessoas com diabetes registrarem e acompanharem a glicemia com **calma e clareza**. Ele oferece metas clínicas personalizáveis, rotinas de medição flexíveis e relatórios para levar à consulta.

**Proposta de valor**
- Ver na hora se a leitura está **dentro da meta**, sem linguagem alarmista.
- Seguir a rotina de medição combinada com o médico, inclusive **ciclos alternados** (ex.: 3x num dia, 1x no outro), economizando fitas sem perder controle.
- Levar ao médico um **histórico organizado** (PDF/planilha) em poucos toques.

**Público:** adultos com diabetes tipo 1, tipo 2, LADA, pré-diabetes ou diabetes gestacional que medem glicemia com glicosímetro de ponta de dedo.

---

## 2. Propostas consolidadas

Decisões tomadas ao longo da definição do produto:

| # | Proposta | Decisão |
|---|---|---|
| 1 | Nome do app | **Mellitus**  |
| 2 | Plataforma | **React Native + Expo + Expo Router + TypeScript** (iOS e Android) |
| 3 | Armazenamento | **100% local no MVP** (SQLite no aparelho), sem servidor nem conta |
| 4 | Temas | **Claro e escuro**, com troca automática (sistema) ou manual |
| 5 | Design system | *Clinical Vitality*: teal clínico, cards suaves, Plus Jakarta Sans. Estilo com **NativeWind** (classes semânticas) + `useTheme()` onde `className` não se aplica |
| 6 | Cores de status | Iguais nos dois temas: **verde** no alvo · **âmbar** fora da meta · **crimson** perigo |
| 7 | Metas | Sempre vindas do **padrão clínico ativo**; nada fixo na interface |
| 8 | Histórico fiel | Cada leitura grava a meta e o status do momento |
| 9 | Organização do código | Pastas em inglês, `nomeComponente/index.tsx`, componentes reutilizáveis em **`src/components`**, um componente por responsabilidade |
| 10 | Backup | **Futuro.** Fora do MVP por enquanto (risco de perda de dados aceito) |
| 11 | Médico | Cadastro **manual** (nome, CRM, especialidade), sem conta profissional |
| 12 | Relatórios | Gerados no aparelho e **compartilhados manualmente** (WhatsApp, e-mail…) |
| 13 | Logo | Gota arredondada com curva suave (glicemia na faixa-alvo), teal + verde |
| 14 | Identificadores | Enums, chaves e valores gravados **sempre em inglês** (`fasting`, `alternating`, `in-range`…). Rótulos em pt-BR só na interface |
| 15 | Ambiente de desenvolvimento | **Expo Go primeiro.** Development build / código nativo só quando um recurso exigir |

---

## 3. Escopo do MVP

### 3.1 Será implementado ✅

**Registro de glicemia**
- Registrar leitura: valor (stepper 40–450 mg/dL), momento, nota e insulina (UI, com marcação de correção).
- Momentos da leitura (`MealContext`):

  | Identificador | Rótulo |
  |---|---|
  | `fasting` | Jejum |
  | `pre-meal` | Pré-refeição |
  | `post-meal-1h` | 1h pós-refeição |
  | `post-meal-2h` | 2h pós-refeição |
  | `pre-dinner` | Pré-jantar |
  | `post-dinner` | Pós-jantar |
  | `bedtime` | Ao deitar |
  | `overnight` | Madrugada |
  | `other` | Outro |
- Sugestão automática do momento da leitura pelo horário e pela rotina do dia.
- Classificação automática: Hipo Severa, Hipo Leve, Abaixo da Meta, No Alvo, Acima da Meta, Hiper Severa.
- Editar e excluir leituras.

**Início (dashboard)**
- Última leitura em destaque, com status, tendência e barra de faixa glicêmica.
- Média do mês e % de tempo no alvo (TIR).
- Rotina do dia: medições feitas/pendentes (ex.: 1/3) e prévia de amanhã.
- Curva glicêmica com faixa-alvo, filtro por período e estatísticas (mínima, máxima, variabilidade).
- Últimos 3 registros e atalho para o histórico.

**Histórico**
- Lista agrupada por dia, navegação por mês e ordenação.
- Filtros por momento (jejum, pré-prandial, pós-prandial, noturno) e estado vazio.

**Metas (padrões clínicos)**
- Padrões prontos: **Diabetes Comum** e **Diabetes Gestacional**.
- **Padrão personalizado:** nome, condição clínica, faixas de jejum, pós-refeição (1h/2h) e ao deitar, limites de alerta de hipo e hiper.
- Simulação de faixa (TIR) ao vivo enquanto edita.
- Dados do médico, instruções de conduta e anexo de receita/laudo (foto ou PDF).
- Salvar como rascunho ou ativar; trocar de padrão sem perder registros.

**Rotina e lembretes**
- Frequência (`FrequencyMode`):

  | Identificador | Rótulo | Regra |
  |---|---|---|
  | `3x` | 3x ao dia | Jejum, pós-almoço e ao deitar |
  | `1x` | 1x ao dia | Jejum |
  | `alternating` | Ciclo alternado | Dia A 3x / Dia B 1x (jejum) |
  | `every-other-day` | Dia sim, dia não | 3x no dia ativo, descanso no seguinte |
  | `every-72h` | Espaçado | 1x em jejum a cada 72h |
  | `custom` | Personalizado | Quantidade (2, 4, 6 ou livre) e momentos escolhidos |
- Lembretes nos horários, com adiar 10 min.
- Timer pós-refeição (1h ou 2h).
- Modo Dia de Descanso (Dia B): menos alertas, lembrete único de jejum, mensagem de incentivo e alerta de segurança se nada for registrado até as 10h.
- Alarme de hipoglicemia com prioridade máxima permitida pelo sistema.

**Relatórios e dados**
- Exportar **PDF** (laudo com resumo, curva e tabela) e **planilha XLSX**.
- Importar planilha **XLSX/CSV** com pré-visualização.
- Lembretes de exportação (semanal/mensal): geram o arquivo e abrem a folha de compartilhamento.
- Apagar todos os dados (com confirmação dupla).

**Geral**
- Onboarding: nome, escolha do padrão inicial e permissão de notificações.
- Tema claro/escuro/automático.
- Acessibilidade: alvos de toque ≥ 44 px, contraste AA, leitores de tela e escala de fonte.
- Funcionamento 100% offline.

### 3.2 Não será implementado no MVP ❌

| Funcionalidade | Motivo | Quando |
|---|---|---|
| Login, conta e sincronização em nuvem | Exige backend | Fase 2 |
| Uso em vários aparelhos | Depende de nuvem | Fase 2 |
| Médico conectado / portal profissional | Exige backend e contas profissionais | Fase 3 |
| Envio automático do laudo ao médico | Exige backend | Fase 2 |
| Assinatura digital, hash e protocolo no laudo | Exige servidor | Fase 3 |
| Glicosímetro Bluetooth | Integração por fabricante | Fase 3 |
| Sensor contínuo (CGM) | Integração complexa e regulada | Futuro |
| Apple Health / Health Connect | Complexidade de permissões | Fase 2 |
| Bloqueio do app por biometria / banco criptografado | Segurança adicional | Fase 2 |
| Contagem de carboidratos / calculadora de bolus | Risco clínico; exige validação | Futuro |
| Unidade mmol/L | Público inicial usa mg/dL | Fase 2 |
| Backup e restauração (.json) | Adiado por decisão de escopo | Futuro |
| Canal de envio do laudo (ex.: WhatsApp) nas configurações de exportação | Exige backend; no MVP o compartilhamento é manual | Futuro |
| Configuração de integrações de saúde (Apple Health / Health Connect) | Na UI do MVP aparece como "Em breve" | Futuro |
| Notificação de checagem de cetonas na Hiper Severa | Orientação clínica; exige validação | Futuro |

---

## 4. Plano de implementação

Ordem pensada para ter um fluxo funcionando de ponta a ponta o quanto antes.

| Etapa | Entrega | Pronto quando… |
|---|---|---|
| **0. Decisões** | Valores clínicos padrão revisados | Faixas e alertas validados por profissional de saúde |
| **1. Projeto** | Expo + Router + TS, `src/`, aliases, lint, testes, fonte e ícones | App abre no celular via Expo Go |
| **2. Tema** | NativeWind configurado, tokens claro/escuro (variáveis CSS + `useTheme`), `ThemeProvider`, tipografia | Uma tela troca de tema com o sistema usando só classes semânticas |
| **3. Regras de negócio** | Tipos + utils: classificação, ciclo, TIR, estatísticas, formatação | Testes unitários passando |
| **4. Banco local** | SQLite, migrations, seed, repositórios, stores | Dados persistem após fechar o app |
| **5. Componentes base** | Botões, cards, badges, campos, switch, segmented, bottom sheet, toast em `src/components` | Componentes funcionando nos dois temas |
| **6. Navegação** | Header, tab bar, 4 abas, modal | Navegação completa com telas vazias |
| **7. Primeiro fluxo** | Registrar glicemia + Início (última leitura e recentes) | Registro aparece no Início após reabrir o app |
| **8. Histórico** | Lista por dia, mês, filtros, ordenação, editar/excluir | Filtros e meses funcionando com dados reais |
| **9. Gráficos** | Curva glicêmica, barra de faixa, anel de progresso, TIR | Início completo |
| **10. Metas** | Padrões, ativação, formulário personalizado, anexos | Trocar de padrão muda as metas em todo o app |
| **11. Rotina e lembretes** | Frequências, ciclo A/B, notificações, modo Dia B, aparência | Lembretes chegam nos horários certos (aparelho físico) |
| **12. Laudo PDF** | HTML do laudo (resumo, curva SVG, tabela), `expo-print`, compartilhamento | PDF legível gerado e compartilhado do aparelho |
| **13. Exportação XLSX** | Planilha de leituras por período (SheetJS) | Planilha abre no Excel/Sheets com todas as colunas |
| **14. Importação XLSX/CSV** | Seleção do arquivo, mapeamento de colunas, pré-visualização, duplicatas, `source = 'import'` | Planilha real importada sem duplicar leituras |
| **15. Lembretes de exportação** | Notificações semanal/mensal que geram o arquivo e abrem o compartilhamento | Lembrete dispara e abre o fluxo de exportação |
| **16. Apagar dados** | Confirmação dupla, limpeza do banco e dos anexos, volta ao onboarding | App volta ao estado inicial sem resíduos |
| **17. Acabamento** | Onboarding, acessibilidade, estados de erro/carregamento | Revisão de acessibilidade concluída |
| **18. Publicação** | Builds EAS, TestFlight e teste interno do Google Play | Usuários de teste usando o app |

> **Expo Go primeiro:** todas as etapas são desenvolvidas no Expo Go. Development build (EAS) ou código nativo só entram quando um recurso exigir (ex.: canal de alarme de hipo com prioridade máxima, *Critical Alerts* no iOS) e, obrigatoriamente, na etapa 18.

---

## 5. Critérios de sucesso do MVP

- Registrar uma glicemia em **menos de 10 segundos**.
- Nenhuma perda de dados entre atualizações do app.
- Lembretes disparando corretamente nos dias A e B do ciclo.
- Laudo PDF legível e aceito pelo médico na consulta.
- Funcionamento completo sem internet.
- Avaliação positiva de usuários de teste quanto a clareza e tranquilidade da interface.

---

## 6. Riscos e cuidados

| Risco | Mitigação |
|---|---|
| Valores clínicos incorretos | Validação por profissional antes do lançamento; textos sem prescrição de conduta automática |
| Perda de dados (sem nuvem e sem backup no MVP) | Risco aceito por enquanto. Exportação XLSX como cópia manual das leituras; backup .json previsto para o futuro |
| Recurso que não funciona no Expo Go | Migrar para development build só quando necessário, sem bloquear as demais etapas |
| Notificações não confiáveis (economia de bateria, Não Perturbe) | Testar em aparelhos reais; orientar o usuário; prioridade máxima para alarme de hipo |
| Bypass do Não Perturbe no iOS | Requer permissão *Critical Alerts* da Apple; até lá, informar a limitação |
| Privacidade de dados de saúde | Dados só no aparelho; nada sai sem ação do usuário; avaliar LGPD antes da Fase 2 |
| Classificação como dispositivo médico | Posicionar como diário de acompanhamento; avaliar exigências da Anvisa antes de funções de dosagem |
| Desenvolvimento no macOS Ventura | Testes iOS via Expo Go / EAS Build na nuvem |

---

## 7. Para desenvolver futuramente

Lacunas identificadas na revisão do roadmap, sem etapa definida por enquanto:

| Lacuna | O que fazer |
|---|---|
| Conformidade para publicação | Política de privacidade, declaração de app de saúde no Google Play, disclaimer médico na App Store, avaliação de LGPD para dados sensíveis locais |
| Testes de migração | Testar a atualização de uma versão do banco para a seguinte com dados reais, garantindo "nenhuma perda de dados entre atualizações" |
| Estimativas e marcos | Prazo por etapa e datas-alvo para os marcos (primeiro fluxo, Início completo, dados, publicação) |
| Log de erros local | Registro de falhas no aparelho, sem servidor, que o usuário possa exportar para diagnóstico |
| Backup e restauração | Especificação guardada em `DESIGN.md` §13.6 |

---

## 8. Próximas fases (visão)

- **Fase 2:** conta e sincronização na nuvem, Apple Health/Health Connect, mmol/L, bloqueio por biometria, envio de relatório por link.
- **Fase 3:** portal do médico (acompanhamento remoto, revisão de padrões), glicosímetros Bluetooth, laudo com assinatura digital.
- **Futuro:** integração com CGM, registro de refeições e carboidratos, insights de padrões glicêmicos.

> ⚠️ O Mellitus é uma ferramenta de registro e acompanhamento e não substitui orientação médica. Faixas e alertas padrão devem ser validados por profissionais de saúde.
