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
| 5 | Design system | *Clinical Vitality*: teal clínico, cards suaves, Plus Jakarta Sans |
| 6 | Cores de status | Iguais nos dois temas: **verde** no alvo · **âmbar** fora da meta · **crimson** perigo |
| 7 | Metas | Sempre vindas do **padrão clínico ativo**; nada fixo na interface |
| 8 | Histórico fiel | Cada leitura grava a meta e o status do momento |
| 9 | Organização do código | Pastas em inglês, `nomeComponente/index.tsx`, componentes reutilizáveis em `shared`, um componente por responsabilidade |
| 10 | Backup | Exportar/restaurar **arquivo .json**, obrigatório já que não há nuvem |
| 11 | Médico | Cadastro **manual** (nome, CRM, especialidade), sem conta profissional |
| 12 | Relatórios | Gerados no aparelho e **compartilhados manualmente** (WhatsApp, e-mail…) |
| 13 | Logo | Gota arredondada com curva suave (glicemia na faixa-alvo), teal + verde |

---

## 3. Escopo do MVP

### 3.1 Será implementado ✅

**Registro de glicemia**
- Registrar leitura: valor (stepper 40–450 mg/dL), momento (jejum, pré/pós-refeição, ao deitar, outro), nota e insulina (UI, com marcação de correção).
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
- Frequência: 3x ao dia, 1x ao dia, **ciclo alternado (Dia A 3x / Dia B 1x)** e personalizada (quantidade e momentos).
- Lembretes nos horários, com adiar 10 min.
- Timer pós-refeição (1h ou 2h).
- Modo Dia de Descanso (Dia B): menos alertas, lembrete único de jejum, mensagem de incentivo e alerta de segurança se nada for registrado até as 10h.
- Alarme de hipoglicemia com prioridade máxima permitida pelo sistema.

**Relatórios e dados**
- Exportar **PDF** (laudo com resumo, curva e tabela) e **planilha XLSX**.
- Importar planilha **XLSX/CSV** com pré-visualização.
- Lembretes de exportação (semanal/mensal).
- **Backup completo (.json)**: exportar, restaurar e lembrete mensal.
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

---

## 4. Plano de implementação

Ordem pensada para ter um fluxo funcionando de ponta a ponta o quanto antes.

| Etapa | Entrega | Pronto quando… |
|---|---|---|
| **0. Decisões** | Valores clínicos padrão revisados | Faixas e alertas validados por profissional de saúde |
| **1. Projeto** | Expo + Router + TS, `src/`, aliases, lint, testes, fonte e ícones | App abre no celular via Expo Go |
| **2. Tema** | Tokens claro/escuro, `ThemeProvider`, `useTheme`, tipografia | Uma tela troca de tema com o sistema |
| **3. Regras de negócio** | Tipos + utils: classificação, ciclo, TIR, estatísticas, formatação | Testes unitários passando |
| **4. Banco local** | SQLite, migrations, seed, repositórios, stores | Dados persistem após fechar o app |
| **5. Componentes base** | Botões, cards, badges, campos, switch, segmented, bottom sheet, toast | Catálogo de componentes nos dois temas |
| **6. Navegação** | Header, tab bar, 4 abas, modal | Navegação completa com telas vazias |
| **7. Primeiro fluxo** | Registrar glicemia + Início (última leitura e recentes) | Registro aparece no Início após reabrir o app |
| **8. Histórico** | Lista por dia, mês, filtros, ordenação, editar/excluir | Filtros e meses funcionando com dados reais |
| **9. Gráficos** | Curva glicêmica, barra de faixa, anel de progresso, TIR | Início completo |
| **10. Metas** | Padrões, ativação, formulário personalizado, anexos | Trocar de padrão muda as metas em todo o app |
| **11. Rotina e lembretes** | Frequência, ciclo A/B, notificações, modo Dia B, aparência | Lembretes chegam nos horários certos (aparelho físico) |
| **12. Dados** | PDF, XLSX, importação, backup/restauração, apagar dados | Backup restaurado em outro aparelho com sucesso |
| **13. Acabamento** | Onboarding, acessibilidade, estados de erro/carregamento | Revisão de acessibilidade concluída |
| **14. Publicação** | Builds EAS, TestFlight e teste interno do Google Play | Usuários de teste usando o app |

---

## 5. Critérios de sucesso do MVP

- Registrar uma glicemia em **menos de 10 segundos**.
- Nenhuma perda de dados entre atualizações do app; backup restaurável.
- Lembretes disparando corretamente nos dias A e B do ciclo.
- Laudo PDF legível e aceito pelo médico na consulta.
- Funcionamento completo sem internet.
- Avaliação positiva de usuários de teste quanto a clareza e tranquilidade da interface.

---

## 6. Riscos e cuidados

| Risco | Mitigação |
|---|---|
| Valores clínicos incorretos | Validação por profissional antes do lançamento; textos sem prescrição de conduta automática |
| Perda de dados (sem nuvem) | Backup .json, lembrete mensal e aviso quando o backup estiver desatualizado |
| Notificações não confiáveis (economia de bateria, Não Perturbe) | Testar em aparelhos reais; orientar o usuário; prioridade máxima para alarme de hipo |
| Bypass do Não Perturbe no iOS | Requer permissão *Critical Alerts* da Apple; até lá, informar a limitação |
| Privacidade de dados de saúde | Dados só no aparelho; nada sai sem ação do usuário; avaliar LGPD antes da Fase 2 |
| Classificação como dispositivo médico | Posicionar como diário de acompanhamento; avaliar exigências da Anvisa antes de funções de dosagem |
| Desenvolvimento no macOS Ventura | Testes iOS via Expo Go / EAS Build na nuvem |

---

## 7. Próximas fases (visão)

- **Fase 2:** conta e sincronização na nuvem, Apple Health/Health Connect, mmol/L, bloqueio por biometria, envio de relatório por link.
- **Fase 3:** portal do médico (acompanhamento remoto, revisão de padrões), glicosímetros Bluetooth, laudo com assinatura digital.
- **Futuro:** integração com CGM, registro de refeições e carboidratos, insights de padrões glicêmicos.

> ⚠️ O Mellitus é uma ferramenta de registro e acompanhamento e não substitui orientação médica. Faixas e alertas padrão devem ser validados por profissionais de saúde.
