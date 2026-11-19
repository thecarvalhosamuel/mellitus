# Mellitus — Design Spec para App Mobile

> Especificação completa para implementar o app **Mellitus** (monitoramento glicêmico) em mobile, consolidada a partir do design system *Clinical Vitality* e das 5 telas de referência (Início, Histórico, Metas, Novo Padrão Personalizado, Ajustes).
> Stack-alvo sugerida: **React Native + Expo** (Expo Router, `react-native-svg`, `expo-notifications`, `expo-font`).
> Idioma da interface: **pt-BR**.
> Temas: **Claro** (seções 2–9) e **Escuro** (seção 10), com troca automática pelo sistema ou manual em Ajustes.

---

## 1. Princípios de Produto e Marca

O app é voltado para gestão de condição crônica (diabetes) e monitoramento metabólico contínuo. Ele deve transmitir **autoridade clínica sem gerar ansiedade**.

- **Precisão clínica moderna + tatilidade humana**: cards brancos elevados sobre fundo levemente azulado, nunca branco puro chapado.
- **Legibilidade imediata**: o valor da glicemia é sempre o elemento dominante da tela.
- **Feedback calmo**: micro-interações tranquilizadoras; vermelho é **reservado** para estados críticos e nunca usado como decoração.
- **Linguagem empática**: textos como "lembretes gentis", "sem sobrecarga mental", "dia leve de descanso".
- **Uso com uma mão**: alvos de toque ≥ 48×48 px (mínimo absoluto 44×44 px), ações principais na metade inferior.

---

## 2. Design Tokens

### 2.1 Cores — tokens implementados (fonte da verdade)

Esquema baseado em Material 3. Estes são os valores efetivamente usados nas telas.

| Token | Hex | Uso |
|---|---|---|
| `surface` / `background` | `#FAF8FF` | Fundo de tela |
| `surface-container-lowest` | `#FFFFFF` | Cards principais, inputs ativos |
| `surface-container-low` | `#F2F3FF` | Sub-blocos dentro de cards, inputs, banners |
| `surface-container` | `#EAEDFF` | Chips neutros, segmented control (trilho) |
| `surface-container-high` | `#E2E7FF` | Botões secundários, card de ciclo, filtros inativos |
| `surface-container-highest` | `#DAE2FD` | Radio desmarcado, switch desligado, bordas |
| `surface-dim` | `#D2D9F4` | — |
| `on-surface` | `#131B2E` | Texto principal |
| `on-surface-variant` | `#3D4947` | Texto secundário, labels |
| `outline` | `#6D7A77` | Ícones neutros, placeholders, "Cancelar" |
| `outline-variant` | `#BCC9C6` | Divisores, bolinha de dia não-atual |
| `primary` | `#00685F` | Marca, CTAs, valores-destaque, aba ativa |
| `on-primary` | `#FFFFFF` | Texto sobre primary |
| `primary-container` | `#008378` | Hover/pressed do CTA |
| `primary-fixed` | `#89F5E7` | Badges "Recomendado", fundo de ícone de destaque |
| `primary-fixed-dim` | `#6BD8CB` | Destaques suaves |
| `on-primary-fixed` | `#00201D` | Texto sobre primary-fixed |
| `on-primary-fixed-variant` | `#005049` | Texto sobre primary-fixed (variante) |
| `secondary` | `#006C49` | Estado "No Alvo", sucesso, dots de status |
| `secondary-container` | `#6CF8BB` | Fundo de badges positivos |
| `on-secondary-container` | `#00714D` | Texto sobre secondary-container |
| `secondary-fixed` | `#6FFBBE` | — |
| `secondary-fixed-dim` | `#4EDEA3` | Zona "elevado" em barra |
| `on-secondary-fixed` | `#002113` | Texto em badge "Modo Custom" |
| `on-secondary-fixed-variant` | `#005236` | Texto em badge "Dentro da Meta" |
| `tertiary` | `#B61722` | Reservado (não usar para status glicêmico — ver 2.2) |
| `tertiary-container` | `#DA3437` | Reservado |
| `tertiary-fixed` | `#FFDAD7` | — |
| `tertiary-fixed-dim` | `#FFB3AD` | — |
| `on-tertiary-fixed-variant` | `#930013` | — |
| `error` | `#BA1A1A` | Erros de formulário/sistema (validação, falha ao salvar) |
| `error-container` | `#FFDAD6` | Fundo de mensagem de erro de sistema |
| `on-error-container` | `#93000A` | Texto sobre error-container |
| `inverse-surface` | `#283044` | Toasts, overlay de modal (40%) |
| `inverse-on-surface` | `#EEF0FF` | Texto em toast |
| `inverse-primary` | `#6BD8CB` | — |
| `surface-tint` | `#006A61` | — |

### 2.2 Cores semânticas de status glicêmico

Os status usam **3 famílias de cor, com o mesmo significado no tema claro e no escuro** (dark na seção 10.2). Os tokens M3 acima servem só para a estrutura.

**Regra:** verde = dentro da meta · âmbar = fora da meta, sem perigo imediato · crimson = perigo (hipoglicemia ou hiperglicemia severa). A direção (alto ou baixo) é dada **pela seta e pelo texto**, nunca só pela cor.

| Status (`GlucoseStatus`) | Quando | Rótulo | Família | Cor base | Fundo do badge | Texto do badge | Ícone |
|---|---|---|---|---|---|---|---|
| `no-alvo` | Dentro da faixa do contexto | No Alvo | Verde | `#10B981` | `#ECFDF5` | `#047857` | Dot 6 px |
| `atencao` | Abaixo do mínimo e ≥ alerta de hipo | Abaixo da Meta | Âmbar | `#F59E0B` | `#FFFBEB` | `#B45309` | ↓ |
| `alto` | Acima do máximo e ≤ alerta de hiper | Acima da Meta | Âmbar | `#F59E0B` | `#FFFBEB` | `#B45309` | ↑ |
| `hipo` | < alerta de hipo (padrão 70) e ≥ 54 | Hipo Leve | Crimson | `#E11D48` | `#FFF1F2` | `#BE123C` | ↓ |
| `hipo-critico` | < 54 | Hipo Severa | Crimson + halo | `#E11D48` | `#FFF1F2` | `#BE123C` | ⇊ |
| `critico` | > alerta de hiper (padrão 200) | Hiper Severa | Crimson + halo | `#E11D48` | `#FFF1F2` | `#BE123C` | ⇈ |
| Contexto (Jejum, Pós-prandial…) | — | — | Neutro | slate | `#F1F5F9` | `#475569` | — (uppercase) |

**Valor numérico** colorido pelo status sobre fundo branco: normal `on-surface`; âmbar `#B45309` (5,0:1); crimson `#BE123C` (6,3:1).

Primary teal conceitual: `#0D9488` (pressed `#0F766E`), alternativo `#14B8A6`.
Neutros conceituais: canvas `#F8FAFC`, texto `#0F172A`, borda card `#E2E8F0`, borda input `#CBD5E1`, divisor `#F1F5F9`, timestamp `#64748B`.

**Fundos tonais de alerta**: cor semântica a 10% de opacidade + borda 1 px a 20%.
**Corredor-alvo em gráficos**: gradiente `#6CF8BB` de 35% → 8%.

> Regra: crimson **somente** para hipoglicemia, hiperglicemia severa, alarmes e ações destrutivas. Nunca decorativo.

### 2.3 Tipografia

Fonte única: **Plus Jakarta Sans** (400, 500, 600, 700). Ícones: **Material Symbols Outlined** (pesos 100–700, FILL 0/1).

| Token | Tamanho | Line-height | Peso | Letter-spacing | Uso |
|---|---|---|---|---|---|
| `display-numeric` | 56 | 60 | 700 | -0.03em | Glicemia (tablet) |
| `display-numeric-mobile` | 44 | 48 | 700 | -0.02em | Glicemia principal, valores do histórico, input do modal |
| `headline-lg` | 32 | 40 | 700 | -0.02em | — |
| `headline-lg-mobile` | 26 | 32 | 700 | -0.01em | Título de página ("Novo Padrão Personalizado") |
| `headline-md` | 22 | 28 | 600 | 0 | Valor em lista de últimos registros |
| `headline-sm` | 18 | 24 | 600 | 0 | Títulos de seção/card, nome do app no header |
| `body-lg` | 16 | 24 | 400 | 0 | — |
| `body-md` | 14 | 20 | 400 | 0 | Corpo padrão, inputs |
| `body-sm` | 12 | 16 | 400 | 0 | Descrições, timestamps |
| `label-lg` | 14 | 18 | 600 | 0.01em | Botões, valores em linhas |
| `label-md` | 12 | 16 | 600 | 0.02em | Labels de campo, títulos de sub-bloco |
| `label-sm` | 10 | 14 | 700 | 0.04em | Badges, chips, abas (muitas vezes UPPERCASE) |

**Regras:**
- Todos os números de métricas usam `fontVariant: ['tabular-nums']` para evitar "tremor" em atualizações.
- Unidade (`mg/dL`) sempre menor e em `on-surface-variant`, alinhada pela baseline ao número.

### 2.4 Espaçamento

| Token | Valor |
|---|---|
| `space-xs` | 4 |
| `space-sm` | 8 |
| `space-md` | 16 |
| `space-lg` | 24 |
| `space-xl` | 32 |
| `margin` (mobile) | 16 |
| `gutter` (mobile) | 16 |
| `margin-tablet` | 32 |
| `gutter-tablet` | 24 |

- Grid mobile: 4 colunas; tablet/large: 8 colunas com split-view (gráfico persistente ao lado dos controles).
- Padding interno de cards: 16. Separação entre micro-badges: 4–8.

### 2.5 Raios

| Token | Valor | Uso |
|---|---|---|
| `sm` | 4 | Badges retangulares pequenos ("Dia A (1 de 3)") |
| `DEFAULT` | 8 | Inputs, botões, sub-blocos |
| `md` | 12 | CTA principal, dropdowns, chips de opção, sub-cards de listas |
| `lg` | 16 | **Todos os cards** e banners |
| `xl` | 24 | Cantos superiores de bottom sheets |
| `full` | 9999 | Pills, chips, avatar, status dots, switches |

> Padrão adotado: cards 16, CTA e dropdown 12, inputs e botões 8, badges pill, bottom sheet 24 no topo.

### 2.6 Elevação

| Nível | Uso | Sombra |
|---|---|---|
| 0 | Canvas | — |
| 1 | Cards, contêineres de métrica | `0 2 8 -2 rgba(15,23,42,0.04)`, `0 1 3 -1 rgba(15,23,42,0.02)` + borda 1 px `#E2E8F0` |
| 2 | Modais, bottom sheets, alertas críticos | `0 12 32 -4 rgba(15,23,42,0.08)`, `0 4 12 -2 rgba(15,23,42,0.04)` |
| Header | Barra superior | `0 1 8 rgba(0,0,0,0.04)` + blur, fundo `surface` 80% |
| Tab bar | Barra inferior | `0 -2 12 rgba(15,23,42,0.04)` + blur, fundo `surface` 85% |

React Native: usar `shadowColor/shadowOpacity/shadowRadius/shadowOffset` (iOS) + `elevation: 1–2` (Android); blur com `expo-blur`.

---

## 3. Estrutura de Navegação

### 3.1 App Shell

**Header fixo (64 px + safe area top)**
- Esquerda: logo (32 px de altura) + coluna com "Mellitus" (`headline-sm`, `primary`) e subtítulo da seção (`label-sm`, `on-surface-variant`): "Início", "Histórico E Registros", "Metas E Padrões", "Configurações E Frequência".
- Direita: avatar 32 px **com a inicial do nome** do usuário (`settings.profile`; fundo `primary-fixed`, texto `on-primary-fixed`) em botão 44×44, que abre os Ajustes. Sem foto e sem dot "online" no MVP, pois não há conta.

**Bottom Tab Bar fixa (64 px + safe area bottom)** — 4 abas:

| Aba | Ícone Material | Label | Rota |
|---|---|---|---|
| Início | `ssid_chart` | Início | `/` (home) |
| Histórico | `calendar_month` | Histórico | `/history` |
| Metas | `track_changes` | Metas | `/goals` |
| Ajustes | `tune` | Ajustes | `/settings` |

- Ícone 24 px, label `label-sm`. Inativa: `on-surface-variant`. Ativa: `primary` + bold.
- Conteúdo com `paddingTop: 64` e `paddingBottom: 112` para não ficar sob as barras.

### 3.2 Rotas e pastas

Para a organização completa do código (pastas em inglês, `nomeComponente/index.tsx`, `shared`), veja a **seção 12**.

| Tela | Rota | Arquivo de rota |
|---|---|---|
| Início | `/` | `src/app/(tabs)/index.tsx` |
| Histórico e Registros | `/history` | `src/app/(tabs)/history/index.tsx` |
| Padrões de Acompanhamento | `/goals` | `src/app/(tabs)/goals/index.tsx` |
| Novo Padrão Personalizado | `/goals/new` | `src/app/(tabs)/goals/new/index.tsx` |
| Configurações e Frequência | `/settings` | `src/app/(tabs)/settings/index.tsx` |
| Registrar Glicemia (modal) | `/newReading` | `src/app/(modals)/newReading/index.tsx` |

Os nomes de rota e de pasta ficam em inglês. Os textos da interface continuam em pt-BR.

---

## 4. Biblioteca de Componentes

### 4.1 Botões

| Variante | Visual | Altura | Raio |
|---|---|---|---|
| **Primary** | Fundo `primary`, texto branco `label-lg`, ícone 20 px à esquerda, sombra md | 48 | 8 (CTA flutuante: 12) |
| **Primary pressed** | `primary-container` + scale 0.98 | | |
| **Secondary tonal** | Fundo `surface-container-low`/`surface-container`, texto `primary` ou `on-surface` | 44 | 8 |
| **Outlined** | Transparente, borda 1.5 px `primary`, texto `primary` | 48 | 8 |
| **Ghost** | Transparente, texto `outline` → `on-surface` no press ("Cancelar") | 44 | 8 |
| **Destructive** | Fundo crimson `#BE123C`, texto branco (6,3:1) | 48 | 8 |
| **Back pill** | `surface-container-low`, ícone `arrow_back` 18 + "Voltar para Metas" `label-md` primary | ~36 | 12 |
| **Link** | Texto `primary` `label-md` + `chevron_right` ("Ver histórico completo") | — | — |

**Estados de feedback no CTA de salvar:**
1. Normal: ícone `save`/`check_circle` + texto.
2. Loading: ícone `progress_activity` girando + "Salvando…" (desabilitado), ~700 ms.
3. Sucesso: fundo `secondary`, ícone `task_alt`/`check` + "Padrão Ativado com Sucesso!" / "Preferências Atualizadas!", volta ao normal após ~2,4–2,6 s.

### 4.2 Badges e Chips

- **Status pill**: `label-sm`, padding 10×4, raio full. Cores e rótulos pela tabela 2.2. Ex.: "● No Alvo" (verde); "↑ Acima da Meta" (âmbar, ícone `arrow_upward` 14); "↓ Hipo Leve" (crimson, ícone `arrow_downward` 14).
- **Contexto de refeição**: "JEJUM", "ANTES DE DORMIR", "2H PÓS-ALMOÇO", "PRÉ-ALMOÇO", "2H PÓS-JANTAR" — `label-sm` uppercase, fundo `surface-container`, raio full.
- **Badge informativo**: "RECOMENDADO" (`primary-fixed`), "MANUTENÇÃO" (`surface-container`), "FLEXÍVEL" (`secondary-container`), "SMART", "ATIVO", "FOCO EM DESCANSO", "MODO CUSTOM", "CICLOS FLEXÍVEIS", "mg/dL", "Pico Digestivo", "Economia de fitas" (ícone `eco`).
- **Tag de dia do ciclo**: "Dia A (1 de 3)" (`primary` 10%, texto `primary`, raio 4); "Dia B (Basal 1x)" (`surface-container-high`).
- **Filter chip**: pill, padding 14×6, `label-sm`. Ativo: `primary` + texto branco + sombra; inativo: `surface-container-high`. Rolagem horizontal sem scrollbar, bleed até as bordas da tela.
- **Number badge de passo**: círculo 24 px `primary`, número `label-sm` bold branco.

### 4.3 Campos de entrada

- **Texto/numérico padrão**: altura 48, raio 8, fundo `surface-container-low`, sem borda; foco → fundo branco + anel 2 px `primary` (sem blur). Placeholder em `outline`. Ícone de ação à direita (`edit` 20 px).
- **Numérico de alvo**: caixa 44 px branca com sombra xs, valor em `headline-sm`, sufixo "mg/dL" `label-sm` `outline`. Rótulo acima ("Mínimo sugerido", "Máximo sugerido", "Base segura", "Teto noturno").
- **Com prefixo inline**: "Mín:", "Máx:", "Até:" posicionados à esquerda dentro do campo.
- **Select**: altura 48, ícone `expand_more` à direita → usar bottom sheet de opções no mobile.
- **Textarea**: 2 linhas, mesmo estilo, `resize: none`.
- **Limite crítico compacto**: pill branca com prefixo "<" ou ">" + input 40–48 px centrado em `label-lg` bold.
- Teclado: `keyboardType="number-pad"` para glicemia; validar 40–450 mg/dL.

### 4.4 Controles de seleção

- **Segmented control**: trilho `surface-container` com padding 4, raio 8; opção ativa = fundo branco, texto `primary` bold, sombra sm, ícone `done`. Ex.: "1 Hora pós-refeição" / "2 Horas (Recomendado)"; "1h"/"2h"; "1 Hora · Protocolo Gestacional" / "2 Horas · Padrão SBD / ADA".
- **Radio card**: card inteiro clicável, indicador 20 px circular (`primary` com dot/check branco quando ativo; `surface-container-highest` quando inativo). Cards inativos com opacidade 0.9 e sombra sm; ativo com sombra md e conteúdo expandido.
- **Option chip card (grid 2 col)**: título `label-md` bold + descrição 11 px. Ativo: borda 2 px `primary`, fundo `primary-fixed` 40%, ícone `check_circle`. Inativo: borda 1 px `surface-container-highest`.
- **Count picker (grid 4 col)**: "2x", "4x", "6x", "Livre" — ativo `primary`, inativo `surface-container-low`.
- **Toggle de momento (grid 2 col)**: ativo `primary` 10% + texto `primary` + `check`; inativo `surface-container-low`.
- **Switch**: 48×28 (grande) ou 40×24 (compacto), thumb branco 24/20 px. Ligado `primary`, desligado `surface-container-highest`. Usar `Switch` nativo com `trackColor` customizado ou componente próprio animado.
- **Stepper**: botões circulares 40 px (recomendado ≥ 48) "−" / "+" em `surface-container`, ±1 por toque, limites 40–450.

### 4.5 Cards

- **Card base (Elevação 1)**: fundo branco, raio 16, padding 16, gap 16.
- **Sub-bloco**: fundo `surface-container-low`, raio 8, padding 12 — agrupa um alvo/regra dentro do card.
- **Banner informativo**: fundo `surface-container-low`/`surface-container`, ícone em quadrado 36–40 px arredondado (`primary-fixed` ou `surface-container-highest`), título `label-md/lg` + texto `body-sm`. Ex.: "Diretriz Clínica Segura" (`medical_services`), "Por que o padrão importa?" (`lightbulb`).
- **Glow decorativo**: círculo 112–128 px `primary` 5% ou `primary-fixed` 25% com blur no canto superior/inferior direito.
- **Card de alerta crítico**: fundo crimson `#FFF1F2`, borda 1 px `#E11D48` a 20%, ícone `crisis_alert` 24 `#E11D48`, título `#BE123C`.

### 4.6 Componentes clínicos especializados

**Metric Card (Última Leitura)**
- Topo: overline "ÚLTIMA LEITURA" + contexto com ícone ("☀ Jejum • Hoje às 07:30"); à direita badge da faixa-alvo ("● 80–130 mg/dL").
- Valor `display-numeric-mobile` em `primary` + "mg/dL"; à direita pill de tendência (ícone `trending_flat`/`trending_up`/`trending_down`/diagonais + "Dentro da Meta").
- Glycemic Range Bar abaixo.
- Grid 2 col de métricas: "Média Mensal 112 mg/dL ✓ Estável"; "% no Alvo 88% tempo 👍 Meta: >70%".

**Glycemic Range Bar**
- Barra horizontal segmentada (altura 8–16, raio full), em 5 zonas calculadas **a partir do padrão ativo e do contexto da leitura**: `< alerta hipo` crimson · `alerta hipo → mínimo` âmbar · `mínimo → máximo` verde · `máximo → alerta hiper` âmbar · `> alerta hiper` crimson.
- Escala de referência abaixo com os limites reais (ex.: 70 · 80 · 130 · 200) e **pip** na posição da leitura atual.
- Escala visual fixa de 40 a 300 mg/dL, com larguras proporcionais. Nunca usar porcentagens fixas.

**Trend Sparkline / Curva Glicêmica (SVG)**
- `viewBox 0 0 340 160`, altura ~176.
- Linhas de grade tracejadas `surface-container`; **faixa-alvo** retangular com gradiente verde e limites tracejados rotulados ("130 (Alvo Sup.)", "80 (Alvo Inf.)").
- Linha `primary` 2.5 px com cantos arredondados (ideal: curva bezier suave) + área preenchida com gradiente `primary` 25% → 0%.
- Pontos: **Dia A** = círculo sólido `primary` com borda branca; **Dia B** = círculo branco com borda `secondary`; **ponto fora da faixa** = cor do seu status (âmbar se acima/abaixo da meta, crimson se hipo ou hiper severa), r=5, com rótulo da mesma cor; **hoje** = r=6 com anel `primary-fixed`.
- Legenda: ● Dia A (3x) · ○ Dia B (1x) · ▬ Alvo (80–130).
- Eixo X: datas com dia do ciclo ("21 Out (Dia A)" … "Hoje [Dia A: 1/3]").
- Implementação: `react-native-svg` (+ `d3-shape` para `curveMonotoneX`) ou `victory-native`.

**Cycle Progress Ring**
- Anel SVG 36 px, raio 14, traço 3.5, trilho `#DAE2FD`, progresso `primary`, label central "1/3" e "Hoje" abaixo.

**Record Row (Histórico)**
- Linha 1: hora `label-lg` + chip de contexto; badge de status à direita.
- Linha 2: valor `display-numeric-mobile` (cor por status, tabela 2.2: `on-surface` no alvo, âmbar fora da meta, crimson em hipo/hiper severa) + "mg/dL"; meta à direita ("Meta: 80–130", "Meta máx: 180" e "Meta mín: 70" na cor do status).
- Linha 3: ícone de refeição/nota + texto truncado; pill de insulina (`syringe` + "0 UI", "4 UI", "Correção +1 UI" em âmbar).

**Recent Record Card (Início)**
- Ícone circular 36 px (`wb_twilight`, `bedtime`), título + "• Hoje, 07:30" + tag de dia do ciclo; linha de meta abaixo; valor `headline-md` + badge "No Alvo" à direita; rodapé com nota em sub-bloco.

**Medical Professional Card**
- Avatar 48 px com iniciais do médico (fundo `primary-fixed`), nome `label-md` bold (+ `check_circle` verificado), "CRM/SP 192.401 • Endocrinologia", status ("Última revisão do plano: Há 12 dias"; no MVP, a data é informada pelo usuário) em `secondary`.

**TIR Simulation**
- Título "Simulação de Faixa (TIR)" + badge "78% no Alvo"; barra multi-zona; escala 50 · 70 · 140 · 200 · 300+; grid 3 col: Hipo < 4% · Alvo > 75% · Hiper < 20%.

### 4.7 Overlays

- **Bottom sheet**: fundo branco, raio superior 24, padding 16, sombra 2xl, overlay `inverse-surface` 40% + blur. Animação slide-in de baixo (~200 ms). Use `@gorhom/bottom-sheet` ou `Modal` com `animationType="slide"`.
- **Toast** (mesmo padrão nos dois temas): fundo `inverse-surface`, texto `inverse-on-surface`, ícone `check_circle` em verde de status (erro: ícone `error` em crimson); posição acima da tab bar (bottom ~80) ou topo (top ~80); duração 2,8–3,2 s; entra com fade + translateY. Variante pill (raio full) ou card (raio 12, com título + descrição).
- **Dropdown**: card branco raio 12, sombra xl, abaixo do botão gatilho; fecha ao tocar fora.

---

## 5. Telas

### 5.1 Início (Dashboard)

Ordem vertical (gap 16):

1. **Saudação**: "Olá, Carlos" (`headline-sm`) + data de hoje por extenso ("Quinta-feira, 24 de Outubro"); à direita pill do padrão ativo ("⚙ Plano Customizado (Ciclo 3x vs 1x)").
2. **Metric Card — Última Leitura** (104 mg/dL, Jejum 07:30, Dentro da Meta, barra de faixa, Média Mensal 112, % no Alvo 88%).
3. **Card de Frequência Programada** (fundo `surface-container-high`): ícone `event_repeat`, "Ciclo Alternado" + tag "Hoje: Dia A (Intensivo - 3x)", progresso das medições do dia ("Jejum (Feito)" em verde • "Pós-Almoço (Pendente)" • "Ao Deitar (Pendente)"), linha "📅 Amanhã: Dia B (Apenas Jejum 1x Basal)"; à direita anel 1/3.
4. **Curva Glicêmica**: título + tag "Ciclo Alternado A/B" + legenda; filtro em pills roláveis (Outubro 2024 · Setembro 2024 · Últimos 30 Dias · Últimos 7 Dias); gráfico; estatísticas em grid 3 col: Mínima 76 (Dia 15) · Máxima 152 (Dia 08) na cor do status (âmbar: acima da meta) · Variabilidade ±18 "Desvio Baixo".
5. **Últimos Registros** (ícone `history`) + link "Ver histórico completo": 3 Recent Record Cards.
6. **CTA sticky** "+ Novo Registro de Glicose" (ícone `water_drop` preenchido), raio 12, sombra lg, fixo acima da tab bar.

**Modal "Registrar Glicemia"** (bottom sheet):
- Header: ícone `water_drop` em círculo + título + botão fechar.
- "VALOR MEDIDO": stepper − [110 mg/dL] + (limites 40–450); badge dinâmico ("Faixa Normal Esperada" / alto / baixo conforme o padrão ativo).
- "Momento da Leitura": grid 2×2 — 2h Pós-Almoço · Pré-Jantar · Ao Deitar · Outro / Lanche (seleção única com `check`). Sugerir pré-seleção com base no horário e no ciclo do dia.
- CTA "Salvar Medição" (ícone `save`) → fecha e mostra toast "Registro de {valor} mg/dL salvo com sucesso!".

### 5.2 Histórico e Registros

1. **Gestão de Dados Clínicos** (fundo `surface-container-low`): ícone `smartphone`, "Dados salvos neste aparelho" + "Último backup: há 3 dias" (ou "Nenhum backup ainda" em âmbar), badge "● 42 leituras". *(MVP: sem nuvem nem Bluetooth — ver seção 13.)*
   - Grid 2 col: **Exportar** (primary, `file_download` + `arrow_drop_down`) e **Importar** (branco, `file_upload`).
   - Dropdown "FORMATOS OFICIAIS": "PDF Médico (Laudo de Consulta) — Com curva, médias e TIR" (`picture_as_pdf`); "Planilha XLSX (Excel) — Tabela tabular compatível com prontuários" (`table_view`).
   - Importar aceita `.xlsx`, `.csv` (`expo-document-picker`).
   - Terceira opção no menu: **"Backup completo (.json)"** — exporta todos os dados do app para restaurar depois (seção 13.6).
2. **Controles**: seletor de mês ("📅 Outubro 2024 ▾" → bottom sheet com Outubro 2024 (Mês Atual) ✓ / Setembro 2024 · 88 registros / Agosto 2024 · 92 registros) e ordenação ("↓ Mais Recente" ⇄ "↑ Mais Antigo").
3. **Filtros por contexto**: Todos (42) · Jejum · Pré-prandial · Pós-prandial · Noturno.
4. **Lista agrupada por dia** (`SectionList`): cabeçalho com dot (primary para hoje, `outline-variant` para demais), "Hoje, 24 de Outubro" + contagem "1 registro" / "3 registros"; Record Rows.
5. **Estado vazio**: ícone `content_paste_off` 48 px, "Nenhum registro encontrado", "Não há medições correspondentes aos filtros selecionados neste mês.", botão "Ver todos os registros".
6. **Rodapé clínico**: ícone `verified`, "Relatório Clínico Pronto — 42 medições auditadas em Outubro de 2024", "Pronto para exportar e levar à consulta" + ícone `lock` com "Dados armazenados apenas neste aparelho". *(MVP: sem hash, assinatura digital nem número de protocolo — dependem de servidor.)*

Dados de exemplo:

| Data | Hora | Contexto | Valor | Meta | Status | Nota | Insulina |
|---|---|---|---|---|---|---|---|
| 24/10 | 07:30 | Jejum | 104 | 80–130 | No Alvo | Café com leite desnatado | 0 UI |
| 23/10 | 22:15 | Antes de Dormir | 122 | 100–140 | No Alvo | Ceia leve | 2 UI |
| 23/10 | 14:15 | 2h Pós-Almoço | 138 | < 180 | No Alvo | Prato executivo salada e frango | 4 UI |
| 23/10 | 07:45 | Jejum | 99 | 80–130 | No Alvo | Acordou bem disposto | 0 UI |
| 22/10 | 20:30 | 2h Pós-Jantar | 188 | máx 180 | Acima da Meta | Pizza com a família (2 fatias) | Correção +1 UI |
| 22/10 | 13:00 | Pré-Almoço | 110 | 80–130 | No Alvo | Antes da refeição | 3 UI |
| 22/10 | 07:15 | Jejum | 92 | 80–130 | No Alvo | Glicemia matinal padrão | 0 UI |
| 21/10 | 07:30 | Jejum | 68 | mín 70 | Hipo Leve | Hipo corrigida com 150ml suco de laranja | 0 UI |

### 5.3 Metas — Padrões de Acompanhamento

1. **Header card**: badge pulsante "● PARÂMETROS CLÍNICOS", título "Padrões de Acompanhamento", descrição; ícone `tune` em quadrado 48 px.
2. **Banner educativo** "Por que o padrão importa?" — gráficos, avisos de hipo/hiper e relatórios PDF/Excel se adaptam aos limites escolhidos.
3. **Radio cards de padrão** (seleção única, badge "● Ativo" no selecionado):

   | Padrão | Subtítulo | Alvos |
   |---|---|---|
   | **Diabetes Comum** | Tipo 1, Tipo 2 e LADA — diretrizes SBD para adultos | Jejum/Pré-prandial 80–130 · 2h Pós-prandial < 180 · Antes de Dormir 100–140 + barra "Faixa Segura Visual — 70% no alvo recomendado" (<70 Hipo · 80–130 Alvo · >180 Hiper) |
   | **Diabetes Gestacional** | Pré-natal & Obstetrícia | Jejum ≤ 95 (70–95) · 1h Pós ≤ 140 · 2h Pós ≤ 120 + nota "Contagem pós-refeição a partir da primeira garfada." |
   | **Padrão Personalizado** | Configurado por você ou endocrinologista — pré-diabetes, atletas, recomendações individuais | Botão "⊕ Criar / Editar Padrão Personalizado" → abre formulário (acordeão) ou navega para 5.4 |

   Formulário inline do personalizado: Nome do Padrão; Meta de Jejum (Mín/Máx); Meta Pós-prandial (Até: X mg/dL + segmented 1h/2h, **padrão 2h**); Limiares de Alerta Crítico — "Notificação Imediata" (Hipoglicemia < 70, Hiperglicemia > 200); selo "Padrão validado com regras de segurança glicêmica."
4. **Card da médica**: Drª Helena Campos, CRM/SP 148.920 • Endocrinologia, "Última revisão do plano: Há 12 dias".
5. **CTA** "Salvar e Aplicar Padrão" + nota "Você pode alternar entre os perfis a qualquer momento sem perder os registros já inseridos." → toast "Padrão Atualizado! {nome} ativo nos gráficos e relatórios."

### 5.4 Novo Padrão Personalizado (stack sobre Metas)

Topo: botão "← Voltar para Metas" e badge "● MODO CUSTOM". Título "Novo Padrão Personalizado" + "Defina parâmetros e faixas terapêuticas sob medida em conjunto com seu médico ou nutricionista." Banner "Diretriz Clínica Segura" (ter em mãos o plano terapêutico/laudo).

Formulário em cards numerados:

**① Identificação do Perfil**
- Nome do Padrão Clínico (ex.: "Plano Dr. Roberto - Alvo Rígido & Treino"; placeholder "Ex: Treino Noturno, Pós-Cirúrgico...").
- Condição ou Objetivo Clínico (select): Diabetes Tipo 1/2 com Alvo Estrito · Pré-Diabetes & Resistência Insulínica · Atleta / Treinamento de Alta Intensidade · Hipoglicemia Reativa / Pós-Bariátrica · Diabetes Gestacional (Protocolo Rígido) · Outro Ajuste Especializado.

**② Alvos Glicêmicos** (badge "mg/dL")
- *Jejum e Pré-Prandial* (`wb_twilight`, badge "No Alvo"): Mínimo 70 · Máximo 120; dica "✓ Faixa ideal recomendada pela SBD: 70 a 130 mg/dL."
- *Pós-Prandial (Após Comer)* (`restaurant`, badge "Pico Digestivo"): Janela de Medição segmented (1 Hora pós-refeição / 2 Horas (Recomendado)); Teto máximo tolerado 140 + feedback "✓ Excelente controle estrito".
- *Noturno & Ao Deitar* (`bedtime`, "Repouso"): Base segura 90 · Teto noturno 130.
- *Limites de Urgência & Alarmes Auditivos* (`notifications_active`):
  - Alarme Crítico de Hipoglicemia (card de alerta crítico crimson, `crisis_alert`): "Alerta sonoro, com bypass do Não Perturbe quando o sistema permitir", valor < 70.
  - Limite de Hiperglicemia Severa (`trending_up`, crimson): "Notificação de checagem de cetonas", valor > 200.

**③ Frequência e Dias de Medição** (badge "Ciclos Flexíveis") — "Periodicidade e Alternância de Dias"
- Grid 2×2 de opções: Dia sim, Dia não (3x no dia ativo e descanso no seguinte) · **Ciclo Alternado** (3x vs 1x — selecionado) · Espaçado (a cada 72h, 1x em jejum) · Personalizado (definir por dias da semana).
- **Detalhamento do Ciclo Ativo** (`sync_alt`, badge "Economia de fitas"):
  - Dia A (Intensivo) — Jejum matinal, Pós-Almoço e Ao Deitar — "3x ao dia".
  - Dia B (Manutenção Basal) — Apenas checagem em Jejum matinal — "1x ao dia".
  - Início da sequência: "Hoje com Dia A ▾".
  - Nota "✓ Controle sem sobrecarga mental e com preservação de acurácia clínica."

**Simulação de Faixa (TIR)** — preview ao vivo dos alvos (ver 4.6). Deve recalcular ao editar os campos.

**④ Equipe Médica** (switch, ligado por padrão; desligar oculta o bloco)
- Card do médico preenchido manualmente pelo usuário (nome, CRM, especialidade) — sem conexão com conta profissional no MVP. Status "Revisado em {data}" no lugar de "Conectado via Mellitus Pro".
- Instruções de Conduta Médica (textarea).
- Botão "📎 Anexar Foto da Receita ou Laudo (PDF/JPG)" (`expo-image-picker` / `expo-document-picker`).

**Ações finais**: "Salvar e Ativar Padrão" (primary) · grid 2 col "Salvar Rascunho" (tonal) / "Cancelar" (ghost).

### 5.5 Ajustes — Configurações e Frequência

Banner "Rotina e Alertas" (ícone `notifications_active` em círculo `secondary-container`, badge "ATIVO", texto sobre lembretes gentis).

**Passo 1 de 3 — Frequência de Controle** (radio cards, seleção única, detalhe expande no selecionado):

| Opção | Badge | Descrição | Detalhe |
|---|---|---|---|
| **3x ao dia** | RECOMENDADO | Controle intensivo padrão | Chips: Jejum 07:00 · Pós-Almoço 14:00 · Ao Deitar 22:00 |
| **1x ao dia** | MANUTENÇÃO | Acompanhamento basal | Jejum Diário 07:30 · "Modo Rodízio Ativável" |
| **Ciclos Alternados** | FLEXÍVEL | Alternância 3x vs 1x (ícone `autorenew`) | "Economia de fitas & sem sobrecarga mental"; Dia A (07:00, 14:00, 22:00) 3x; Dia B Jejum 07:30 1x; Início da sequência "Hoje com Dia A" |
| **Personalizado** | FLEXÍVEL | Momentos, quantidades e intervalos livres (ícone `tune`) | Meta de medições/dia: 2x · 4x · 6x · Livre; Momentos (multi-seleção): Jejum · Pré-Almoço · Pós-Almoço (2h) · Pré-Jantar · Pós-Jantar (2h) · Madrugada (03h) |

**Passo 2 de 3 — Lembretes & Notificações**
- Alarmes nos horários (switch) — toque discreto + vibração, adiar 10 min.
- Timer Pós-Refeição (`timer`) — inicia ao registrar refeição; segmented 1 Hora (Protocolo Gestacional) / 2 Horas (Padrão SBD / ADA).
- Lembretes adaptativos aos dias do ciclo (badge SMART, switch) — alarmes só nos momentos do dia ativo.
- Nota: "O alarme pós-prandial evita que você esqueça o pico de absorção glicêmica." (`spa`).
- **Modo Dia de Descanso (Dia B)** (`self_improvement`, badge "FOCO EM DESCANSO"):
  - Reduzir frequência de alertas (switch) — silencia pós-refeição e ao deitar no Dia B.
  - Lembrete gentil único de Jejum — 08:00 • Toque suave matinal.
  - Incentivo & bem-estar (switch).
  - Alerta de segurança passivo (switch) — aviso às 10h se nenhuma medição for registrada.
  - "Economia estimada de 2 alarmes e 2 fitas nos dias programados de descanso." (`energy_savings_leaf`).

**Passo 3 de 3 — Exportação & Conectividade**
- Relatórios Clínicos: no MVP viram **lembretes de exportação** — "Planilha semanal (toda segunda 08:00)" e "Laudo mensal (PDF)". A notificação local abre o app, que gera o arquivo no aparelho e abre a folha de compartilhamento (WhatsApp, e-mail…). Pill toggle "✓ Ativo" / "Inativo".
- **Backup dos dados**: "Exportar backup (.json)" · "Restaurar backup" · data do último backup · lembrete mensal de backup (switch).
- ~~INTEGRAÇÕES DE SAÚDE~~ (Apple Health / Health Connect): **fora do MVP** — exibir card desabilitado "Em breve" ou ocultar.

Card "Salvo neste aparelho" (`verified`, texto: "Suas configurações entram em vigor imediatamente. Faça backups periódicos para não perder seus dados.") no lugar de "Sincronização em Tempo Real" + CTA "Salvar Preferências de Frequência" com estados loading → sucesso → toast "Preferências salvas com sucesso!".

---

## 6. Modelo de Dados

```ts
type MealContext =
  | 'jejum' | 'pre-prandial' | 'pos-prandial-1h' | 'pos-prandial-2h'
  | 'pre-jantar' | 'pos-jantar' | 'ao-deitar' | 'madrugada' | 'outro';

type GlucoseStatus = 'hipo-critico' | 'hipo' | 'no-alvo' | 'atencao' | 'alto' | 'critico';

interface GlucoseReading {
  id: string;
  value: number;            // mg/dL, 40–450
  timestamp: string;        // ISO
  context: MealContext;
  note?: string;            // "Café com leite desnatado"
  insulinUnits?: number;    // UI
  isCorrection?: boolean;   // "Correção +1 UI"
  cycleDay?: 'A' | 'B';
  cycleSlot?: { index: number; total: number }; // "1 de 3"
  patternId?: string;       // padrão ativo no momento da leitura
  target?: TargetRange;     // meta vigente naquele momento (snapshot)
  status: GlucoseStatus;    // classificação gravada junto (ver 13.3)
  source: 'manual' | 'import';   // MVP: sem Bluetooth/CGM
}

interface TargetRange { min?: number; max?: number; }

interface ClinicalPattern {
  id: string;
  name: string;                         // "Diabetes Comum", "Plano Dr. Roberto..."
  kind: 'comum' | 'gestacional' | 'custom';
  condition?: 'dm-estrito' | 'pre-diabetes' | 'atleta' | 'hipo-reativa' | 'gestacional' | 'outro';
  fasting: TargetRange;                 // 80–130
  postprandial: TargetRange & { windowHours: 1 | 2 };
  bedtime: TargetRange;                 // 100–140
  alerts: { hypo: number; hyper: number; hypoBypassDND: boolean };
  medicalTeam?: { name: string; crm: string; specialty: string; notes?: string; attachments?: string[] };
  status: 'ativo' | 'rascunho' | 'inativo';
  reviewedAt?: string;
}

type FrequencyMode = '3x' | '1x' | 'alternado' | 'dia-sim-dia-nao' | 'espacado-72h' | 'personalizado';

interface FrequencySchedule {
  mode: FrequencyMode;
  dayA?: { label: string; moments: { context: MealContext; time: string }[] }; // 3x
  dayB?: { label: string; moments: { context: MealContext; time: string }[] }; // 1x
  cycleStart: string;            // data em que começa com Dia A
  customCount?: 2 | 4 | 6 | 'livre';
  customMoments?: MealContext[];
}

interface ReminderSettings {
  alarmsEnabled: boolean;
  snoozeMinutes: 10;
  postMealTimerHours: 1 | 2;
  adaptiveToCycle: boolean;
  restDay: { reduceAlerts: boolean; gentleFastingTime: string; encouragement: boolean; passiveSafetyAlertAt: string };
}

interface ExportSettings {
  weeklyXlsx: { enabled: boolean; weekday: 1; time: '08:00' };
  monthlyAgpPdf: { enabled: boolean; channel: 'whatsapp' };
  integrations: { appleHealth: boolean; healthConnect: boolean };
}
```

### 6.1 Regras de negócio

- **Classificação de status** de uma leitura: comparar com a faixa do padrão ativo para o contexto (`fasting`, `postprandial`, `bedtime`).
  - `< 54` → `hipo-critico` (Hipo Severa).
  - `< alerts.hypo` → `hipo` (Hipo Leve).
  - Abaixo do mínimo e ≥ `alerts.hypo` → `atencao` (Abaixo da Meta).
  - Dentro da faixa → `no-alvo`.
  - Acima do máximo e ≤ `alerts.hyper` → `alto` (Acima da Meta).
  - `> alerts.hyper` → `critico` (Hiper Severa; dispara notificação de checagem de cetonas).
  - Cores, ícones e rótulos de cada status: tabela 2.2.
- **Fonte única das metas:** toda meta exibida (badge do hero tile, "Meta: 80–130" no histórico, faixa do gráfico, barras) vem do **padrão ativo**, ou da meta gravada na própria leitura no caso de leituras antigas. Nenhum valor de meta fica fixo na interface.
- **Ciclo alternado**: `dia = diferençaEmDias(hoje, cycleStart) % 2 === 0 ? 'A' : 'B'`. Dia A: 3 medições; Dia B: 1 (jejum).
- **Progresso do dia**: medições feitas / previstas para o dia do ciclo (ex.: 1/3).
- **% no Alvo (TIR)**: leituras "No Alvo" / total do período. Meta > 70%; TIR recomendado > 75% no personalizado; Hipo < 4%; Hiper < 20%.
- **Estatísticas do período**: mínima, máxima (com dia), média, desvio-padrão (variabilidade "±18 — Desvio Baixo").
- **Notificações** (`expo-notifications`): agendar lembretes por momento do ciclo; timer pós-refeição a partir do registro de refeição; alerta passivo às 10h se nenhuma leitura no dia; alarme de hipo com prioridade máxima (iOS: *critical alerts* exige entitlement da Apple; Android: canal de alta importância com bypass DND).

---

## 7. Movimento e Interação

- Pressionar botões/cards: `scale 0.98`, 100–150 ms.
- Transições de cor/estado: 150–200 ms ease.
- Bottom sheet: slide-up 200 ms; overlay fade.
- Toast: fade + translateY 12 px → 0, 300 ms; auto-dismiss 2,6–3,2 s.
- Acordeão do formulário personalizado e detalhes de radio cards: expandir com `LayoutAnimation` ou Reanimated.
- Dot "PARÂMETROS CLÍNICOS" com pulse sutil.
- Nada de animações alarmistas; alertas críticos usam cor + ícone + texto, não piscadas.

---

## 8. Acessibilidade

- Contraste AA mínimo: texto principal `#131B2E` sobre `#FAF8FF`/`#FFFFFF`.
- Status **nunca só por cor**: sempre ícone (dot, ↑, ↓) + texto ("No Alvo", "Acima da Meta", "Hipo Leve").
- Alvos de toque ≥ 44 (ideal 48); thumbs de slider/stepper ≥ 32.
- `accessibilityLabel` em botões só de ícone (avatar "Perfil ativo", fechar, ±); `accessibilityRole="radio"`/`"switch"` e `accessibilityState={{ checked }}` nos controles de seleção.
- Suporte a Dynamic Type/font scale sem quebrar o valor principal (usar `adjustsFontSizeToFit` no número grande se necessário).
- Leitura noturna: tema escuro completo especificado na seção 10.

---

## 9. Implementação em React Native + Expo

**Dependências sugeridas**

```bash
npx expo install expo-router expo-font @expo-google-fonts/plus-jakarta-sans \
  react-native-svg expo-blur expo-notifications expo-document-picker \
  expo-image-picker expo-file-system expo-sharing react-native-reanimated \
  react-native-safe-area-context
npm i @gorhom/bottom-sheet d3-shape date-fns
# Ícones Material Symbols: @expo/vector-icons (MaterialIcons/MaterialCommunityIcons)
# ou react-native-material-symbols para fidelidade total
# Estilo: NativeWind (Tailwind para RN) reaproveita os nomes de tokens das telas
```

**theme.ts (resumo)**

```ts
export const colors = {
  surface: '#FAF8FF', surfaceLowest: '#FFFFFF', surfaceLow: '#F2F3FF',
  surfaceContainer: '#EAEDFF', surfaceHigh: '#E2E7FF', surfaceHighest: '#DAE2FD',
  onSurface: '#131B2E', onSurfaceVariant: '#3D4947', outline: '#6D7A77', outlineVariant: '#BCC9C6',
  primary: '#00685F', primaryContainer: '#008378', primaryFixed: '#89F5E7', primaryFixedDim: '#6BD8CB',
  onPrimary: '#FFFFFF', onPrimaryFixed: '#00201D',
  secondary: '#006C49', secondaryContainer: '#6CF8BB', onSecondaryContainer: '#00714D',
  tertiary: '#B61722', tertiaryContainer: '#DA3437', tertiaryFixedDim: '#FFB3AD',
  error: '#BA1A1A', errorContainer: '#FFDAD6', onErrorContainer: '#93000A',
  inverseSurface: '#283044', inverseOnSurface: '#EEF0FF',
  status: {
    inTarget:  { base: '#10B981', bg: '#ECFDF5', border: 'rgba(16,185,129,0.20)', fg: '#047857', value: '#131B2E' },
    outOfGoal: { base: '#F59E0B', bg: '#FFFBEB', border: 'rgba(245,158,11,0.20)', fg: '#B45309', value: '#B45309' },
    danger:    { base: '#E11D48', bg: '#FFF1F2', border: 'rgba(225,29,72,0.20)',  fg: '#BE123C', value: '#BE123C' },
    context:   { bg: '#F1F5F9', border: '#E2E8F0', fg: '#475569' },
  },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, margin: 16 };
export const radius = { sm: 4, base: 8, md: 12, lg: 16, xl: 24, full: 9999 }; // card = lg, sheet = xl

export const type = {
  displayNumeric:       { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 44, lineHeight: 48, letterSpacing: -0.88 },
  headlineLgMobile:     { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 26, lineHeight: 32, letterSpacing: -0.26 },
  headlineMd:           { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 22, lineHeight: 28 },
  headlineSm:           { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, lineHeight: 24 },
  bodyMd:               { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 20 },
  bodySm:               { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 16 },
  labelLg:              { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, lineHeight: 18, letterSpacing: 0.14 },
  labelMd:              { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.24 },
  labelSm:              { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, lineHeight: 14, letterSpacing: 0.4 },
};

export const elevation = {
  card:  { shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  sheet: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
};
```

> Em RN, `letterSpacing` é em pixels: em × fontSize (ex.: -0.02em × 44 = -0.88).

**Componentes a criar**: veja a árvore completa e as regras de separação na **seção 12**.

---

## 10. Dark Mode

> Fonte: design system *Clinical Vitality — Dark* e a tela Início em modo escuro. As demais telas seguem as mesmas regras de mapeamento (10.4).

### 10.1 Princípios

- **"Dark Modernism" clínico**: base ardósia profunda que absorve luz e reduz fadiga ocular em leituras noturnas (cabeceira, madrugada).
- **Indicadores bioluminescentes**: verde/teal com brilho sutil (*glow*) isolam o que é dado clínico; o resto recua.
- **Hierarquia por camadas tonais + bordas finas**, não por sombras pesadas.
- Contraste alto para leitura sob luz direta do sol ou no escuro total.

### 10.2 Tokens de cor (Material 3 — dark)

| Token | Hex | Token | Hex |
|---|---|---|---|
| `surface` / `background` / `surface-dim` | `#051424` | `primary` | `#4FDBC8` |
| `surface-container-lowest` | `#010F1F` | `on-primary` | `#003731` |
| `surface-container-low` | `#0D1C2D` | `primary-container` | `#14B8A6` |
| `surface-container` | `#122131` | `on-primary-container` | `#00423B` |
| `surface-container-high` | `#1C2B3C` | `primary-fixed` | `#71F8E4` |
| `surface-container-highest` / `surface-variant` | `#273647` | `primary-fixed-dim` | `#4FDBC8` |
| `surface-bright` | `#2C3A4C` | `inverse-primary` | `#006B5F` |
| `on-surface` / `on-background` | `#D4E4FA` | `secondary` | `#4EDEA3` |
| `on-surface-variant` | `#BBCAC6` | `on-secondary` | `#003824` |
| `outline` | `#859490` | `secondary-container` | `#00A572` |
| `outline-variant` | `#3C4947` | `on-secondary-container` | `#00311F` |
| `inverse-surface` | `#D4E4FA` | `tertiary` | `#FFB2B7` |
| `inverse-on-surface` | `#233143` | `tertiary-container` | `#FF7B88` |
| `surface-tint` | `#4FDBC8` | `on-tertiary` | `#67001B` |
| `error` | `#FFB4AB` | `on-tertiary-container` | `#7A0022` |
| `on-error` | `#690005` | `tertiary-fixed` / `-dim` | `#FFDADB` / `#FFB2B7` |
| `error-container` | `#93000A` | `on-tertiary-fixed(-variant)` | `#40000D` / `#92002A` |
| `on-error-container` | `#FFDAD6` | `secondary-fixed` / `-dim` | `#6FFBBE` / `#4EDEA3` |

**Cores de texto usadas diretamente na tela** (slate):

| Papel | Hex | Uso |
|---|---|---|
| Texto forte | `#FFFFFF` / `#F8FAFC` | Valores de glicemia, títulos de seção, nomes |
| Texto de corpo | `#D4E4FA` / `#E2E8F0` | Corpo geral |
| Texto secundário | `#CBD5E1` | Contexto ("Jejum • Hoje às 07:30"), notas, metas |
| Metadados | `#94A3B8` | Unidades `mg/dL`, timestamps, labels, abas inativas |
| Texto sobre tint primário | `#71F8E4` (`primary-fixed`) | Tags "Dia A", pill do plano, opção selecionada |

**Cores de status (dark):**

| Estado | Base | Fundo do badge | Borda | Texto | Dot / glow |
|---|---|---|---|---|---|
| **No Alvo** | `#10B981` | `emerald-950` a 70% (`#022C22`) | `#065F46` (emerald-800) ou `emerald-700` a 60% | `#6EE7B7` (emerald-300) | `#34D399` + `0 0 6px #34D399` |
| **Fora da meta** (Abaixo/Acima da Meta) | `#F59E0B` (amber) | `#F59E0B` a 12% | `#F59E0B` a 30% | `#FBBF24` (amber-400) | — |
| **Perigo** (Hipo Leve/Severa, Hiper Severa) | `#F43F5E` (rose-500) | `#F43F5E` a 12% | `#F43F5E` a 30% | `#FB7185` (rose-400) | `0 0 8px rgba(244,63,94,.4)` |
| **Contexto neutro** | — | `#16273C` | `#233852` | `#CBD5E1` | — |

> Mesma semântica do tema claro (2.2): **verde = no alvo**, **âmbar = fora da meta** (acima ou abaixo), **crimson = perigo** (hipo, hiper severa, queda rápida, alarmes). Ex.: "Máxima 152" com meta 80–130 usa âmbar `#FBBF24`.

### 10.3 Superfícies efetivas, bordas e elevação

| Papel | Claro | Escuro |
|---|---|---|
| Canvas | `#FAF8FF` | `#051424` |
| Header | `surface` 80% + blur | `#051424` 85% + blur, borda inferior `#16273C`, sombra `black/20` |
| Tab bar | `surface` 85% + blur | `#0B1320` 90% + blur, borda superior `#1E293B`, sombra `black` |
| Card (nível 1–2) | `#FFFFFF` + sombra suave | `#0D1C2D` + borda 1 px `#1E334A` + sombra `0 4 20 -2 rgba(0,0,0,.45)` |
| Card de destaque (ciclo) | `#E2E7FF` | Gradiente horizontal `#0D1C2D → #122131` + borda `#1E334A` |
| Sub-bloco / célula de métrica / nota | `#F2F3FF` | `#081726` + borda `#1B2C3E` |
| Pill informativa recuada ("Amanhã…") | `#FFFFFF` 70% | `#06121F` 90% + borda `#1B2B3D` |
| Chip/controle inativo | `#EAEDFF` | `#122131` + borda `#1F3146` (pressed `#1A2E44`) |
| Trilho de barra de faixa | `#EAEDFF` | `#081523` + borda `#1B2B3D` |
| Trilho do anel de progresso | `#DAE2FD` | `#16273C` |
| Grade do gráfico | `#EAEDFF` | `#1E2F42` |
| Bottom sheet (nível 3) | `#FFFFFF` | `#0D1C2D` + borda superior `#1E334A`, divisor do header `#1B2B3D`, sombra `0 12 32 -4 rgba(0,0,0,.65)`, raio superior 24 |
| Overlay do modal | `inverse-surface` 40% | `#010F1F` 80% + blur md |
| Divisor genérico | `#F1F5F9` | `rgba(148,163,184,.12)` |

**Brilhos (biometric glow)** — usar com parcimônia, só em dados e estados ativos:

| Elemento | Glow |
|---|---|
| Número da glicemia principal | `drop-shadow 0 2 8 rgba(255,255,255,.12)` |
| Pip "104 atual" e aba ativa | `drop-shadow 0 0 6–8 rgba(79,219,200,.5)` |
| Segmento "alvo" da barra | `0 0 10 rgba(16,185,129,.5)` |
| Segmento "hipo" da barra | `0 0 8 rgba(244,63,94,.4)` |
| Chip de período ativo | `0 0 12 rgba(79,219,200,.3)` |
| Ícone em círculo primário | `0 0 12 rgba(79,219,200,.2)` |
| Linha do gráfico | `drop-shadow 0 0 6 rgba(20,184,166,.45)` |
| Progresso do anel | `drop-shadow 0 0 4 #14B8A6` |
| Avatar (iniciais) | anel 2 px `primary` 40% + `0 0 10 rgba(79,219,200,.25)` |
| Card em hipo grave | halo `0 0 24 -4 rgba(244,63,94,.25)` |
| Card estável no alvo (opcional) | halo `0 0 24 -6 rgba(20,184,166,.20)` |
| Logo | `brightness 1.1` + `0 0 8 rgba(79,219,200,.35)` |
| Glow decorativo do card principal | círculo 144 px `primary` 10% blur 2xl no canto superior direito |

> No React Native, `drop-shadow` de texto/SVG não existe nativamente. Aproximar com `textShadowColor/textShadowRadius` em textos, e com `shadowColor` colorido (iOS) ou um traço duplicado e mais largo com baixa opacidade sob a linha do gráfico (Android).

### 10.4 Componentes no dark

**Botões**
- **Primary CTA** ("+ Novo Registro de Glicose", "Salvar Medição"): gradiente horizontal `#0D9488 → #14B8A6`, raio 12, sombra `teal-950` 50%, texto bold. Pressed: `#0F766E → #0D9488`.
  - **Texto escuro `#051424`** (4,95:1 a 7,45:1 ao longo do gradiente). A tela de referência usa branco, que reprova o contraste (2,5:1).
- **Secondary**: `#1E293B` (ou `#122131`), texto `#F8FAFC`, borda 1 px `rgba(148,163,184,.16)`.
- **Urgente (hipo / quick-assist)**: `#F43F5E` com texto branco. Uso exclusivo para ações críticas.
- **Link**: texto `primary` `#4FDBC8`.
- **Stepper ±**: círculo 40–48 px, `#122131` + borda `#1E334A`, texto branco. Pressed `#1A2E44`.

**Chips, badges e tags**
- **Chip de período ativo**: fundo `primary` `#4FDBC8`, texto `#003731` bold e glow. Inativo: `#122131` + borda `#1F3146` + texto `#94A3B8`.
- **Pill do plano ativo**: `primary` 10% + borda `primary` 25% + texto `#71F8E4` + ícone `tune` preenchido.
- **Tag "Dia A"**: `primary` 20% + borda `primary` 30% + texto `#71F8E4`, raio 4. **Tag "Dia B"**: `#16273C` + borda `#233852` + texto `#CBD5E1`.
- **Badges de status**: conforme a tabela 10.2, sempre com borda.
- **Pill de tendência** ("→ ✓ Dentro da Meta"): emerald-950 60% + borda emerald-800 + texto `#34D399` + blur sm, raio 8.

**Seleção e entrada**
- **Opção selecionada** (momento da leitura, radio card, segmented): `primary` 20% + borda `primary` 40% + texto `#71F8E4` + ícone `check`. Não selecionada: `#122131` + borda `#1E334A` + texto `#94A3B8`.
- **Inputs**: `#111827`/`#0D1C2D` + borda 1 px `rgba(148,163,184,.2)`. No foco, traço de 1,5 px `#14B8A6`. Placeholder `#94A3B8`.
- **Switch**: trilho desligado `#0F172A` (com borda `#1E334A` para não sumir no fundo), trilho ligado `primary` 30% e thumb `#10B981`. Alternativa mais simples: trilho ligado `#14B8A6` com thumb branco.
- **Checkbox**: raio 4, ativo teal com check `#051424`.
- **Input do valor no modal**: `display-reading-mobile` em `primary` + glow `rgba(79,219,200,.4)`.

**Gráfico (Curva Glicêmica)**
- Faixa-alvo: gradiente `#10B981` de 22% → 4%; limites tracejados `#10B981` 80%, 1,2 px; rótulos `#34D399`.
- Linha `#14B8A6` 2,5 px com glow; área com gradiente `#14B8A6` de 32% → 0%.
- **Dia A**: ponto sólido `#14B8A6` com borda `#051424`. **Dia B**: preenchimento `#0D1C2D` com borda `#14B8A6`/`#10B981`.
- **Ponto fora da faixa**: cor do status, com borda branca e rótulo na mesma cor: âmbar `#FBBF24` fora da meta, crimson `#F43F5E` em hipo ou hiper severa.
- **Hoje**: ponto `#4FDBC8` r = 6 com glow e rótulo `#4FDBC8`. Rótulos de destaque em `#71F8E4`.
- Eixo X: `#94A3B8`. "Ontem" em `#CBD5E1`; "Hoje" em `primary` bold.
- Legenda: dot `primary` com glow · círculo vazado · retângulo emerald 40% com borda emerald-400 50%.

**Barra de faixa glicêmica / TIR**
- Mesmas 5 zonas do tema claro (4.6), calculadas do padrão ativo: `< hipo` `#F43F5E` 80% (glow) · `hipo→mín` `#FBBF24` 80% · `mín→máx` `#10B981` (glow) · `máx→hiper` `#FBBF24` 80% · `> hiper` `#F43F5E` 80%.
- Trilho `#081523` com borda `#1B2B3D`, altura 10 px.
- Na variante TIR, rótulos de porcentagem `label-md` tabular abaixo de cada faixa.

**Hero tile (Última Leitura)**
- A borda do card acompanha o status: teal/verde no alvo, âmbar acima, crimson abaixo (com halo nos casos críticos).
- Pode exibir delta desde a leitura anterior ("−4 mg/dL desde 07:30") e há quanto tempo foi medido ("há 2 h"). Sensor contínuo (CGM) fica fora do MVP.
- Seta de tendência em 7 estados: ⇈ ↑ ↗ → ↘ ↓ ⇊.

**Ícones em círculo** (registros recentes): emerald-950 60% + borda emerald-800 + ícone `#34D399`, 36 px.

**Toast**: mesmo padrão do claro: `inverse-surface` `#D4E4FA`, texto `#233143` (10,2:1), ícone de sucesso `#059669` (ou de erro `#E11D48`), formato pill, sombra xl.

**Imagens**: logo com versão para fundo escuro, ou `brightness 1.1` + glow. Avatares de iniciais (usuário e médico) com fundo `primary` 20% e texto `#71F8E4`.

### 10.5 Tipografia no dark

Mesma escala da seção 2.3, com estes ajustes do design system escuro:

| Token | Mudança |
|---|---|
| `display-reading` / `display-reading-mobile` | Novo nome de `display-numeric` (56/60 e 44/48, 700) |
| `headline-md` | letter-spacing −0.01em |
| `body-sm` | letter-spacing 0.01em |
| `label-sm` | line-height 12, letter-spacing 0.06em |
| `unit-reading` (novo) | 14/18, peso 500, +0.04em: unidades (`mg/dL`, `mmol/L`, `g carbs`, `U`), em `#94A3B8`, podem ser uppercase |

Títulos usam **bold** (700) no dark para compensar o efeito de "halo" do texto claro sobre fundo escuro. Números sempre com `tabular-nums`.

### 10.6 Telas — aplicação do dark

- **Início**: implementação de referência (screen.png).
- **Histórico**:
  - Cards de registro em `#0D1C2D` com borda; valor em branco, ou `#FB7185` (hipo/alto crítico) e `#FBBF24` (acima da meta).
  - Pill de insulina em `#081726`; "Correção +1 UI" em âmbar.
  - Cabeçalho do dia: dot `primary` com glow (hoje) ou `#3C4947` (demais dias).
  - Botão Exportar = CTA com gradiente. Importar = secondary.
  - Dropdown e seletor de mês em sheet `#0D1C2D`.
  - Rodapé clínico em `#081726` com ícone em círculo `primary` 15%.
- **Metas**:
  - Radio card ativo com borda `primary` 40% e halo teal suave. Inativo com borda `#1E334A` e opacidade 0.9.
  - Bloco de alvos em `#081726`.
  - Nota gestacional e banner educativo em `#122131`.
- **Novo Padrão**:
  - Card "Alarme Crítico de Hipoglicemia" com fundo `#F43F5E` 12%, borda 30%, ícone e texto `#FB7185` e halo crimson.
  - Limite de hiperglicemia severa com o mesmo estilo de perigo (crimson), sem halo.
  - Inputs conforme 10.4. Simulação TIR com a barra do dark.
- **Ajustes**:
  - Switches dark.
  - Badges "RECOMENDADO" em `primary` 20% com texto `#71F8E4`; "MANUTENÇÃO" em `#16273C`.
  - Chip "XLS" em emerald-950 com texto `#6EE7B7`; chip "PDF" em `primary` 20% com texto `#71F8E4` (crimson não é usado de forma decorativa).
  - Nova linha **Aparência**: Automático (sistema) · Claro · Escuro.

### 10.7 Implementação (React Native + Expo)

```ts
// src/shared/theme/dark/index.ts
export const darkColors = {
  bg: '#051424', header: 'rgba(5,20,36,0.85)', tabBar: 'rgba(11,19,32,0.90)',
  card: '#0D1C2D', cardBorder: '#1E334A', cardGradient: ['#0D1C2D', '#122131'],
  inset: '#081726', insetBorder: '#1B2C3E', recessed: 'rgba(6,18,31,0.9)',
  control: '#122131', controlBorder: '#1F3146', controlPressed: '#1A2E44',
  track: '#081523', ringTrack: '#16273C', grid: '#1E2F42',
  sheet: '#0D1C2D', overlay: 'rgba(1,15,31,0.8)', divider: 'rgba(148,163,184,0.12)',
  textStrong: '#F8FAFC', text: '#D4E4FA', textSecondary: '#CBD5E1', textMuted: '#94A3B8',
  primary: '#4FDBC8', onPrimary: '#003731', primaryFixed: '#71F8E4',
  primaryTint: 'rgba(79,219,200,0.20)', primaryTintBorder: 'rgba(79,219,200,0.40)',
  cta: ['#0D9488', '#14B8A6'], ctaPressed: ['#0F766E', '#0D9488'], onCta: '#051424', // nunca branco
  status: {
    inTarget:  { base: '#10B981', bg: 'rgba(2,44,34,0.7)', border: '#065F46', fg: '#6EE7B7', dot: '#34D399', value: '#FFFFFF' },
    outOfGoal: { base: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.30)', fg: '#FBBF24', value: '#FBBF24' },
    danger:    { base: '#F43F5E', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.30)', fg: '#FB7185', value: '#FB7185' },
    context:   { bg: '#16273C', border: '#233852', fg: '#CBD5E1' },
  },
};
```

- Criar `lightColors` com **as mesmas chaves semânticas** (`bg`, `card`, `inset`, `control`…) a partir da seção 2, para que os componentes nunca usem hex direto.
- `ThemeProvider` com `useColorScheme()` + preferência salva na tabela `settings` do SQLite (chave `appearance`): `'system' | 'light' | 'dark'`.
- `app.json`: `"userInterfaceStyle": "automatic"`. Ajustar `expo-status-bar` (`style="light"` no dark) e `expo-navigation-bar` (Android).
- Gradientes com `expo-linear-gradient`; blur do header/tab bar com `expo-blur` (`tint="dark"`).
- No Android, `elevation` gera sombra cinza pouco visível no dark: confiar em **borda + diferença tonal**.
- Contrastes verificados no fundo do card `#0D1C2D`: `#94A3B8` 6,7:1 · `#CBD5E1` 11,6:1 · `#4FDBC8` 10,1:1 · `#FB7185` 6,4:1 · `#FBBF24` 10,3:1 · `#003731` sobre `#4FDBC8` 7,7:1.

---

## 11. Decisões de Design (inconsistências resolvidas)

As telas de referência tinham contradições entre si. Abaixo, o que foi decidido. **Este documento já reflete essas decisões**, e elas prevalecem sobre as imagens originais.

| # | Inconsistência nas telas | Decisão | Onde está aplicada |
|---|---|---|---|
| 1 | Faixa de jejum variava (80–130, 70–130, 70–120) | Toda meta exibida vem do **padrão ativo** (ou da meta gravada na leitura). Nada fixo na interface | 6.1, 13.3 |
| 2 | Meta "Ao Deitar" variava ("< 140" e "100–140") | Mesma regra do item 1. No padrão Diabetes Comum: **100–140** | 5.3, 13.4 |
| 3 | Janela pós-prandial do personalizado variava (1h e 2h) | Padrão **2h**. 1h só quando escolhido (ex.: gestacional) | 5.3, 5.4 |
| 4 | Barras de faixa com larguras e escalas fixas e diferentes | 5 zonas calculadas do padrão ativo, escala fixa de 40–300 e pip na posição real | 4.6, 10.4 |
| 5 | Cor de hipo divergente (vermelho nas telas, indigo no design system claro, crimson no escuro) | **3 famílias iguais nos dois temas**: verde = no alvo, âmbar = fora da meta, crimson = perigo. Direção indicada por seta e texto | 2.2, 10.2 |
| 6 | Raio dos cards: 12 nas telas, 16 no design system | **Cards 16**, CTA e dropdown 12, inputs 8, sheet 24 | 2.5 |
| 7 | Datas incoerentes entre Início e Histórico | Datas sempre reais. Nos exemplos, "hoje" = quinta-feira, 24 de outubro | 5.1, 5.2 |
| 8 | Avatar com foto feminina e saudação "Olá, Carlos" | Avatar com a **inicial do nome** salvo no aparelho, sem foto | 3.1, 4.6 |
| 9 | Texto branco no CTA com gradiente (dark) com contraste 2,5:1 | **Texto `#051424`** no CTA do dark | 10.4 |
| 10 | Paleta de canvas do dark divergente entre o texto do DS e a tela | Valores da tela (`#051424` / `#0D1C2D` / `#122131`), coerentes com o tema claro | 10.2, 10.3 |
| 11 | Toast verde sólido no dark e neutro no claro | **`inverse-surface` nos dois temas**, com ícone colorido pelo resultado | 4.7, 10.4 |
| 12 | "Conectado via Mellitus Pro", nuvem, Bluetooth, hash e assinatura digital | Fora do MVP, já que os dados ficam no aparelho | 13.9 |
| 13 | Uso decorativo de vermelho (chip "PDF", "Correção" em vermelho) | Crimson só para perigo e ações destrutivas | 2.2, 10.6 |

### Pendências fora do design

- **Validação clínica:** faixas padrão, limiares de alerta (70, 54, 200) e textos de conduta precisam de revisão por profissional de saúde antes do lançamento.
- **Referências a entidades** (SBD, ADA, SBEM) nos textos: confirmar o uso com quem fizer a validação clínica.
- **Bypass do Não Perturbe:** no iOS exige a permissão *Critical Alerts* da Apple. Até lá, usar notificação de prioridade máxima (Android: canal de alta importância) e informar a limitação ao usuário.

> ⚠️ As faixas, alertas e condutas exibidas são exemplos de interface. Valores clínicos definitivos devem ser validados por profissionais de saúde antes de qualquer uso real.

---

## 12. Arquitetura de Pastas e Componentes

### 12.1 Convenções

- **Nomes de pastas e arquivos em inglês.** Os textos da interface continuam em pt-BR.
- **Todo componente é uma pasta `nomeComponente/` (camelCase) com `index.tsx`.** Exemplo: `glucoseChart/index.tsx`. O componente exportado usa PascalCase (`export function GlucoseChart`).
- Arquivos opcionais dentro da pasta do componente, criados só quando necessários:

  ```
  lastReadingCard/
    index.tsx        # JSX + composição (obrigatório)
    styles.ts        # StyleSheet / estilos derivados do tema
    types.ts         # props e tipos locais
    useLastReadingCard.ts  # lógica (estado, derivação de dados)
    components/      # subcomponentes usados SÓ por este componente
  ```

- **Exceção do Expo Router:** `_layout.tsx` precisa manter esse nome. Os arquivos de rota ficam em `pasta/index.tsx` e só importam a tela correspondente de `src/screens`.
- **Imports por alias:** `@/shared/...`, `@/screens/...`, `@/services/...` (configurar `tsconfig.json` → `paths`).

### 12.2 Quando um componente vai para `shared`

| Situação | Onde fica |
|---|---|
| Usado em **2 ou mais telas** ou primitivo visual do design system (botão, card, badge, input) | `src/shared/components/...` |
| Usado em uma única tela | `src/screens/<tela>/components/...` |
| Usado só dentro de outro componente | `<componente>/components/...` |
| Começou local e passou a ser usado em outra tela | **Promover** para `shared` (mover a pasta, não duplicar) |

### 12.3 Regras de tamanho e responsabilidade

- **Uma responsabilidade por componente.** Cada um apresenta *uma* coisa: um card, uma linha, uma seção.
- **Telas só compõem seções.** O `index.tsx` de uma tela monta as seções na ordem certa e conecta os dados (store/hook), sem estilização detalhada.
- **Limite indicativo de ~150 linhas por `index.tsx`.** Passou disso, extrair subcomponentes ou mover lógica para um hook `useNomeComponente.ts`.
- **Lógica fora do JSX.** Classificação de status, cálculo de TIR, dia do ciclo e formatação ficam em `shared/utils` ou em hooks, nunca inline nos componentes.
- **Componentes de UI não acessam stores.** Recebem dados por props. Só telas, seções e hooks leem estado global.
- **Sem hex direto nos componentes.** Usar sempre `useTheme()` com as chaves semânticas (`colors.card`, `colors.status.low.fg`…), para claro e escuro funcionarem automaticamente.
- **Não separar sem motivo.** Um trecho de 10 linhas que não se repete e não tem lógica pode ficar no próprio componente. O objetivo é legibilidade, não fragmentação.

### 12.4 Árvore completa

```
src/
├── app/                                   # Expo Router — rotas finas
│   ├── _layout.tsx                        # fontes, ThemeProvider, providers, Stack raiz
│   ├── (tabs)/
│   │   ├── _layout.tsx                    # Tabs com AppHeader + TabBar customizados
│   │   ├── index.tsx                      # → screens/home
│   │   ├── history/index.tsx              # → screens/history
│   │   ├── goals/
│   │   │   ├── index.tsx                  # → screens/goals
│   │   │   └── new/index.tsx              # → screens/newPattern
│   │   └── settings/index.tsx             # → screens/settings
│   └── (modals)/
│       └── newReading/index.tsx           # → screens/newReading (bottom sheet)
│
├── screens/
│   ├── home/
│   │   ├── index.tsx                      # compõe as seções do Início
│   │   └── components/
│   │       ├── greetingHeader/index.tsx           # "Olá, Carlos" + data + pill do padrão ativo
│   │       ├── lastReadingCard/
│   │       │   ├── index.tsx                      # card hero (compõe as partes)
│   │       │   ├── useLastReadingCard.ts          # status, posição do pip, tendência
│   │       │   └── components/
│   │       │       ├── readingHeader/index.tsx    # overline + contexto + badge da faixa
│   │       │       └── summaryMetrics/index.tsx   # Média Mensal + % no Alvo
│   │       ├── cycleScheduleCard/
│   │       │   ├── index.tsx                      # card "Ciclo Alternado"
│   │       │   └── components/
│   │       │       ├── todayMomentsList/index.tsx # Jejum (Feito) • Pós-Almoço (Pendente)…
│   │       │       └── tomorrowPreview/index.tsx  # "Amanhã: Dia B…"
│   │       ├── glucoseCurveSection/
│   │       │   ├── index.tsx                      # título + legenda + filtro + gráfico + stats
│   │       │   └── components/
│   │       │       ├── chartLegend/index.tsx
│   │       │       └── periodStats/index.tsx      # Mínima / Máxima / Variabilidade
│   │       ├── recentReadingsSection/
│   │       │   ├── index.tsx                      # título + link + lista
│   │       │   └── components/
│   │       │       └── recentReadingCard/index.tsx
│   │       └── newReadingButton/index.tsx         # CTA sticky
│   │
│   ├── newReading/
│   │   ├── index.tsx                      # bottom sheet "Registrar Glicemia"
│   │   ├── useNewReading.ts               # valor, contexto sugerido, salvar
│   │   └── components/
│   │       ├── sheetHeader/index.tsx
│   │       └── glucoseValueInput/index.tsx        # stepper ± valor + badge de faixa esperada
│   │
│   ├── history/
│   │   ├── index.tsx
│   │   ├── useHistory.ts                  # filtro, ordenação, mês, agrupamento por dia
│   │   └── components/
│   │       ├── dataSyncPanel/
│   │       │   ├── index.tsx                      # sync + contagem + botões
│   │       │   └── components/
│   │       │       ├── syncStatus/index.tsx
│   │       │       ├── exportMenu/index.tsx       # dropdown PDF / XLSX
│   │       │       └── importButton/index.tsx
│   │       ├── historyToolbar/
│   │       │   ├── index.tsx
│   │       │   └── components/
│   │       │       ├── monthPickerButton/index.tsx
│   │       │       └── sortToggle/index.tsx
│   │       ├── monthPickerSheet/index.tsx
│   │       ├── readingDayGroup/
│   │       │   ├── index.tsx                      # cabeçalho do dia + linhas
│   │       │   └── components/
│   │       │       ├── dayGroupHeader/index.tsx
│   │       │       └── readingRow/
│   │       │           ├── index.tsx
│   │       │           └── components/
│   │       │               ├── readingRowHeader/index.tsx  # hora + contexto + status
│   │       │               ├── readingRowValue/index.tsx   # valor + meta
│   │       │               └── readingRowFooter/index.tsx  # nota + insulina
│   │       └── clinicalReportFooter/index.tsx
│   │
│   ├── goals/
│   │   ├── index.tsx
│   │   ├── useGoals.ts                    # padrão selecionado, aplicar
│   │   └── components/
│   │       ├── goalsHeader/index.tsx              # "Padrões de Acompanhamento"
│   │       ├── patternCard/
│   │       │   ├── index.tsx                      # radio card genérico de padrão
│   │       │   └── components/
│   │       │       ├── patternCardHeader/index.tsx
│   │       │       └── patternTargetsList/index.tsx
│   │       ├── customPatternCard/
│   │       │   ├── index.tsx                      # card + botão expandir
│   │       │   └── components/
│   │       │       └── quickCustomForm/index.tsx  # formulário inline resumido
│   │       └── applyPatternFooter/index.tsx       # CTA + nota
│   │
│   ├── newPattern/
│   │   ├── index.tsx                      # compõe os passos do formulário
│   │   ├── schema.ts                      # validação (zod)
│   │   ├── useNewPatternForm.ts           # react-hook-form + submit/rascunho
│   │   └── components/
│   │       ├── newPatternHeader/index.tsx         # voltar + "MODO CUSTOM" + título
│   │       ├── profileStep/index.tsx              # ① nome + condição clínica
│   │       ├── targetsStep/
│   │       │   ├── index.tsx                      # ②
│   │       │   └── components/
│   │       │       ├── fastingTargets/index.tsx
│   │       │       ├── postMealTargets/index.tsx
│   │       │       ├── bedtimeTargets/index.tsx
│   │       │       └── criticalAlerts/
│   │       │           ├── index.tsx
│   │       │           └── components/
│   │       │               └── alertThresholdRow/index.tsx
│   │       ├── frequencyStep/
│   │       │   ├── index.tsx                      # ③
│   │       │   └── components/
│   │       │       ├── frequencyModelGrid/index.tsx
│   │       │       └── cycleDetails/
│   │       │           ├── index.tsx
│   │       │           └── components/
│   │       │               ├── cycleDayRow/index.tsx
│   │       │               └── cycleStartPicker/index.tsx
│   │       ├── tirSimulationCard/index.tsx        # preview ao vivo
│   │       ├── medicalTeamStep/
│   │       │   ├── index.tsx                      # ④ switch + bloco
│   │       │   └── components/
│   │       │       ├── medicalNotesField/index.tsx
│   │       │       └── attachmentButton/index.tsx
│   │       └── formActions/index.tsx              # Salvar e Ativar / Rascunho / Cancelar
│   │
│   └── settings/
│       ├── index.tsx
│       ├── useSettings.ts
│       └── components/
│           ├── routineBanner/index.tsx            # "Rotina e Alertas"
│           ├── frequencySection/
│           │   ├── index.tsx                      # Passo 1
│           │   └── components/
│           │       ├── frequencyOptionCard/index.tsx
│           │       ├── scheduleChips/index.tsx
│           │       ├── alternatingCycleDetails/index.tsx
│           │       └── customFrequencyBuilder/
│           │           ├── index.tsx
│           │           └── components/
│           │               ├── dailyCountPicker/index.tsx
│           │               └── momentsGrid/index.tsx
│           ├── remindersSection/
│           │   ├── index.tsx                      # Passo 2
│           │   └── components/
│           │       ├── postMealTimerSelector/index.tsx
│           │       └── restDaySettings/index.tsx
│           ├── exportSection/
│           │   ├── index.tsx                      # Passo 3
│           │   └── components/
│           │       ├── autoReportItem/index.tsx
│           │       └── healthIntegrationTile/index.tsx
│           ├── appearanceSection/index.tsx        # Automático / Claro / Escuro
│           ├── syncInfoCard/index.tsx
│           └── saveSettingsButton/index.tsx
│
├── shared/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── appHeader/index.tsx                # logo + título + subtítulo + avatar
│   │   │   ├── tabBar/index.tsx
│   │   │   ├── screenContainer/index.tsx          # safe area + paddings do header/tab bar
│   │   │   └── sectionHeader/index.tsx            # ícone + título + ação opcional
│   │   ├── ui/
│   │   │   ├── button/index.tsx                   # variants: primary | secondary | outlined | ghost | danger
│   │   │   ├── gradientButton/index.tsx           # CTA com gradiente (dark)
│   │   │   ├── iconButton/index.tsx
│   │   │   ├── backButton/index.tsx
│   │   │   ├── card/index.tsx                     # variants: default | highlight | recessed
│   │   │   ├── subBlock/index.tsx
│   │   │   ├── badge/index.tsx                    # pill/tag genérico
│   │   │   ├── filterChips/index.tsx              # lista horizontal rolável
│   │   │   ├── stepBadge/index.tsx                # círculo numerado ①②③
│   │   │   ├── stepHeader/index.tsx               # stepBadge + título + badge
│   │   │   ├── textField/index.tsx
│   │   │   ├── numericField/index.tsx             # valor + unidade (alvos, limites)
│   │   │   ├── selectField/index.tsx              # abre bottomSheet de opções
│   │   │   ├── textAreaField/index.tsx
│   │   │   ├── segmentedControl/index.tsx
│   │   │   ├── selectableCard/index.tsx           # base de radio cards e opções
│   │   │   ├── optionGrid/index.tsx               # grid de opções (single/multi)
│   │   │   ├── switch/index.tsx
│   │   │   ├── toggleRow/index.tsx                # título + descrição + switch
│   │   │   ├── stepper/index.tsx
│   │   │   ├── bottomSheet/index.tsx
│   │   │   ├── toast/index.tsx
│   │   │   ├── infoBanner/index.tsx
│   │   │   ├── emptyState/index.tsx
│   │   │   ├── avatar/index.tsx
│   │   │   ├── icon/index.tsx                     # wrapper Material Symbols
│   │   │   └── divider/index.tsx
│   │   └── glucose/                               # componentes de domínio reutilizados
│   │       ├── glucoseValue/index.tsx             # número + mg/dL (tamanhos e cor por status)
│   │       ├── statusBadge/index.tsx              # No Alvo / Acima / Hipo
│   │       ├── contextChip/index.tsx              # JEJUM, 2H PÓS-ALMOÇO…
│   │       ├── cycleDayTag/index.tsx              # Dia A (1 de 3) / Dia B
│   │       ├── trendIndicator/index.tsx           # seta de tendência + texto
│   │       ├── insulinPill/index.tsx              # 0 UI / Correção +1 UI
│   │       ├── glycemicRangeBar/
│   │       │   ├── index.tsx
│   │       │   └── components/
│   │       │       ├── rangeSegments/index.tsx
│   │       │       └── rangeScale/index.tsx       # rótulos + pip da leitura atual
│   │       ├── timeInRangeSummary/index.tsx       # Hipo / Alvo / Hiper (%)
│   │       ├── cycleProgressRing/index.tsx
│   │       ├── readingContextPicker/index.tsx     # momento da leitura (modal e filtros)
│   │       ├── doctorCard/index.tsx               # Metas e Novo Padrão
│   │       └── glucoseChart/
│   │           ├── index.tsx                      # compõe o SVG
│   │           ├── useChartScale.ts               # escalas x/y, path suavizado
│   │           └── components/
│   │               ├── chartGrid/index.tsx
│   │               ├── targetBand/index.tsx
│   │               ├── chartLine/index.tsx        # linha + área com gradiente
│   │               ├── chartPoint/index.tsx       # Dia A / Dia B / pico / hoje
│   │               └── chartXAxis/index.tsx
│   ├── hooks/
│   │   ├── useTheme/index.ts
│   │   ├── useGlucoseStatus/index.ts
│   │   ├── useCycleDay/index.ts
│   │   └── useToast/index.ts
│   ├── theme/
│   │   ├── index.ts                               # ThemeProvider + tipo Theme
│   │   ├── light/index.ts
│   │   ├── dark/index.ts
│   │   ├── typography/index.ts
│   │   ├── spacing/index.ts
│   │   ├── radius/index.ts
│   │   └── elevation/index.ts
│   ├── utils/
│   │   ├── glucose/index.ts                       # classifyReading, getTargetForContext
│   │   ├── cycle/index.ts                         # getCycleDay, getTodayMoments
│   │   ├── stats/index.ts                         # tir, média, desvio, min/máx
│   │   └── format/index.ts                        # datas pt-BR, mg/dL, UI
│   ├── types/
│   │   ├── reading/index.ts
│   │   ├── pattern/index.ts
│   │   ├── schedule/index.ts
│   │   └── settings/index.ts
│   └── constants/
│       ├── defaultPatterns/index.ts               # Diabetes Comum, Gestacional
│       └── readingContexts/index.ts               # labels e ícones de cada contexto
│
├── database/                                      # persistência local (seção 13)
│   ├── client/index.ts                            # abre mellitus.db (expo-sqlite)
│   ├── migrations/index.ts                        # versões via PRAGMA user_version
│   ├── seed/index.ts                              # padrões padrão + settings iniciais
│   └── repositories/
│       ├── readings/index.ts
│       ├── patterns/index.ts
│       ├── attachments/index.ts
│       └── settings/index.ts
│
├── services/
│   ├── notifications/index.ts                     # lembretes e alarmes locais
│   ├── attachments/index.ts                       # copia receitas/laudos para o app
│   ├── backup/index.ts                            # exportar / restaurar .json
│   ├── export/
│   │   ├── pdf/index.ts                           # laudo (expo-print)
│   │   └── xlsx/index.ts                          # planilha (SheetJS)
│   └── import/index.ts                            # .xlsx / .csv
│
└── stores/
    ├── readings/index.ts
    ├── patterns/index.ts
    └── settings/index.ts                          # frequência, lembretes, aparência
```

### 12.5 Exemplo de composição

Tela fina, que só compõe seções:

```tsx
// src/screens/home/index.tsx
export function HomeScreen() {
  const { lastReading, cycle, recentReadings } = useHomeData();

  return (
    <ScreenContainer>
      <GreetingHeader />
      <LastReadingCard reading={lastReading} />
      <CycleScheduleCard cycle={cycle} />
      <GlucoseCurveSection />
      <RecentReadingsSection readings={recentReadings} />
      <NewReadingButton />
    </ScreenContainer>
  );
}
```

Componente que reutiliza peças de `shared` e delega a lógica:

```tsx
// src/screens/home/components/lastReadingCard/index.tsx
export function LastReadingCard({ reading }: LastReadingCardProps) {
  const { status, target, trend, pipPosition } = useLastReadingCard(reading);

  return (
    <Card variant="hero" status={status}>
      <ReadingHeader context={reading.context} time={reading.timestamp} target={target} />
      <View style={styles.valueRow}>
        <GlucoseValue value={reading.value} size="hero" />
        <TrendIndicator trend={trend} status={status} />
      </View>
      <GlycemicRangeBar target={target} currentValue={reading.value} pipPosition={pipPosition} />
      <SummaryMetrics />
    </Card>
  );
}
```

Rota do Expo Router, que só reexporta a tela:

```tsx
// src/app/(tabs)/index.tsx
export { HomeScreen as default } from '@/screens/home';
```

---

## 13. Persistência Local (MVP)

No MVP, **todos os dados ficam somente no aparelho**. Não há backend, conta, login, sincronização em nuvem nem integração com glicosímetro ou sensor. O app funciona 100% offline.

### 13.1 Tecnologias

| Necessidade | Escolha | Por quê |
|---|---|---|
| Leituras, padrões, anexos, configurações | **`expo-sqlite`** (banco `mellitus.db`) | Oficial do Expo, funciona no Expo Go, consultas por data/contexto, transações, aguenta anos de leituras |
| Arquivos anexados (receitas, laudos) | **`expo-file-system`** (`documentDirectory/attachments/`) | O banco guarda só o caminho do arquivo |
| IDs | **`expo-crypto`** → `randomUUID()` | IDs estáveis para backup/restauração |
| Estado em memória | **`zustand`** | Stores leem/escrevem via repositórios |
| Exportar PDF | **`expo-print`** + **`expo-sharing`** | Gera o laudo a partir de HTML, no aparelho |
| Exportar/importar planilha | **`xlsx` (SheetJS)** + `expo-file-system` + `expo-document-picker` | Sem servidor |
| Lembretes e alarmes | **`expo-notifications`** (notificações locais agendadas) | Não exige push nem servidor |

```bash
npx expo install expo-sqlite expo-file-system expo-crypto expo-print expo-sharing expo-document-picker expo-image-picker expo-notifications
npm i zustand xlsx
```

> Não usar AsyncStorage para dados clínicos: não tem consultas nem transações e fica lento com milhares de leituras. Todas as configurações também ficam no SQLite (tabela `settings`), para que um único arquivo de backup leve tudo.

### 13.2 Fluxo de dados

```
Tela / seção ──► hook (useHistory, useNewReading…) ──► store (zustand) ──► repository ──► SQLite
                                                          ▲                                   │
                                                          └──────── dados carregados ◄────────┘
```

- **Componentes nunca acessam o banco.** Só os repositórios (`src/database/repositories/*`) executam SQL.
- **Inicialização** (`src/app/_layout.tsx`): manter a splash → abrir o banco → rodar migrations → rodar o seed na primeira execução → carregar padrão ativo e settings → esconder a splash.
- **Gravação otimista:** o store atualiza a UI e o repositório grava. Se falhar, desfaz e mostra um toast de erro.
- **Histórico paginado por mês:** consulta `WHERE measured_at BETWEEN …` em vez de carregar todas as leituras na memória.
- Escritas que tocam mais de uma tabela (ex.: ativar um padrão) usam `withTransactionAsync`.

### 13.3 Esquema do banco

```sql
-- PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;

CREATE TABLE patterns (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  kind                  TEXT NOT NULL CHECK (kind IN ('comum','gestacional','custom')),
  condition             TEXT,                       -- dm-estrito | pre-diabetes | atleta | ...
  fasting_min           INTEGER,
  fasting_max           INTEGER,
  postmeal_max          INTEGER,
  postmeal_window_hours INTEGER NOT NULL DEFAULT 2 CHECK (postmeal_window_hours IN (1,2)),
  bedtime_min           INTEGER,
  bedtime_max           INTEGER,
  alert_hypo            INTEGER NOT NULL DEFAULT 70,
  alert_hyper           INTEGER NOT NULL DEFAULT 200,
  hypo_bypass_dnd       INTEGER NOT NULL DEFAULT 1,
  doctor_name           TEXT,
  doctor_crm            TEXT,
  doctor_specialty      TEXT,
  medical_notes         TEXT,
  reviewed_at           TEXT,                       -- informado pelo usuário
  status                TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','draft','inactive')),
  is_builtin            INTEGER NOT NULL DEFAULT 0, -- Diabetes Comum / Gestacional (não editáveis)
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);
-- Garante no máximo UM padrão ativo
CREATE UNIQUE INDEX idx_patterns_single_active ON patterns(status) WHERE status = 'active';

CREATE TABLE readings (
  id               TEXT PRIMARY KEY,
  value            INTEGER NOT NULL CHECK (value BETWEEN 20 AND 600),  -- mg/dL
  measured_at      TEXT NOT NULL,                  -- ISO 8601 com fuso
  context          TEXT NOT NULL,                  -- jejum | pre-prandial | pos-prandial-2h | ...
  note             TEXT,
  insulin_units    REAL,
  is_correction    INTEGER NOT NULL DEFAULT 0,
  cycle_day        TEXT CHECK (cycle_day IN ('A','B')),
  cycle_slot_index INTEGER,
  cycle_slot_total INTEGER,
  -- "foto" da classificação no momento da leitura: trocar de padrão não reescreve o histórico
  pattern_id       TEXT REFERENCES patterns(id) ON DELETE SET NULL,
  target_min       INTEGER,
  target_max       INTEGER,
  status           TEXT NOT NULL,                  -- hipo-critico | hipo | no-alvo | atencao | alto | critico
  source           TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','import')),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX idx_readings_measured_at ON readings(measured_at DESC);
CREATE INDEX idx_readings_context     ON readings(context, measured_at DESC);

CREATE TABLE attachments (
  id          TEXT PRIMARY KEY,
  pattern_id  TEXT NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  file_uri    TEXT NOT NULL,                       -- caminho relativo a documentDirectory
  mime_type   TEXT NOT NULL,                       -- image/jpeg | application/pdf
  created_at  TEXT NOT NULL
);

CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,                       -- JSON
  updated_at  TEXT NOT NULL
);
```

- O **valor de entrada do usuário** continua limitado a 40–450 no stepper. O banco aceita 20–600 para leituras importadas de planilhas de glicosímetros.
- **Status e meta são gravados na leitura** para que o histórico mostre a meta válida *naquele dia* ("Meta: 80–130"), mesmo se o padrão mudar depois.
- Guardar `file_uri` **relativo** porque o caminho absoluto do `documentDirectory` muda entre instalações no iOS.

**Chaves da tabela `settings`** (valor em JSON, tipos da seção 6):

| Chave | Conteúdo |
|---|---|
| `profile` | `{ name: "Carlos" }`: só o nome para a saudação, sem conta |
| `appearance` | `'system' \| 'light' \| 'dark'` |
| `frequency` | `FrequencySchedule` (modo, Dia A/B, horários, início do ciclo) |
| `reminders` | `ReminderSettings` |
| `exportReminders` | lembretes de planilha semanal / laudo mensal |
| `backup` | `{ lastBackupAt, monthlyReminder: boolean }` |
| `onboarding` | `{ completedAt }` |

### 13.4 Migrations e seed

- Versão do esquema em `PRAGMA user_version`. `migrations/index.ts` exporta uma lista ordenada `[{ version: 1, up: sql }, …]` e aplica, dentro de uma transação, as versões maiores que a atual.
- **Nunca editar uma migration já publicada.** Mudanças sempre entram como nova versão.
- **Seed** (só se `patterns` estiver vazia):
  - "Diabetes Comum" (80–130 / < 180 em 2h / 100–140 / hipo 70 / hiper 200), `is_builtin = 1`, `status = 'active'`.
  - "Diabetes Gestacional" (≤ 95 / ≤ 140 em 1h / ≤ 120 em 2h), `is_builtin = 1`.
  - Settings padrão: `appearance = 'system'`, frequência 3x ao dia, lembretes ligados.

### 13.5 Repositórios (contratos)

```ts
// src/database/repositories/readings/index.ts
export const readingsRepository = {
  create(input: NewReading): Promise<GlucoseReading>,          // calcula status/meta antes de gravar
  update(id: string, patch: Partial<NewReading>): Promise<void>,
  remove(id: string): Promise<void>,
  getLatest(): Promise<GlucoseReading | null>,
  listRecent(limit: number): Promise<GlucoseReading[]>,
  listByMonth(year: number, month: number, opts?: { context?: MealContext; order?: 'asc' | 'desc' }): Promise<GlucoseReading[]>,
  countByMonth(): Promise<{ month: string; total: number }[]>, // seletor de mês
  statsForRange(from: string, to: string): Promise<PeriodStats>, // min, max, média, desvio, TIR
  listForDay(date: string): Promise<GlucoseReading[]>,          // progresso do ciclo (1/3)
};

// src/database/repositories/patterns/index.ts
export const patternsRepository = {
  getActive(): Promise<ClinicalPattern>,
  list(): Promise<ClinicalPattern[]>,
  save(pattern: ClinicalPatternInput, opts: { activate: boolean }): Promise<ClinicalPattern>, // rascunho ou ativo
  activate(id: string): Promise<void>,                          // transação: desativa o atual + ativa o novo
  remove(id: string): Promise<void>,                            // bloqueado para is_builtin
};

// src/database/repositories/settings/index.ts
export const settingsRepository = {
  get<K extends SettingsKey>(key: K): Promise<SettingsMap[K]>,
  set<K extends SettingsKey>(key: K, value: SettingsMap[K]): Promise<void>,
};
```

Depois de salvar `frequency` ou `reminders`, chamar `notificationsService.reschedule()`, que cancela e reagenda todas as notificações locais conforme o ciclo.

### 13.6 Backup e restauração (essencial sem nuvem)

Sem servidor, **desinstalar o app ou trocar de celular apaga os dados**. Por isso o MVP precisa de backup manual:

- **Exportar backup** (Ajustes e menu Exportar do Histórico): gera `mellitus-backup-AAAA-MM-DD.json` e abre a folha de compartilhamento, para salvar em Arquivos, Drive, e-mail etc.

  ```json
  {
    "app": "mellitus",
    "schemaVersion": 1,
    "exportedAt": "2026-11-19T11:44:00-03:00",
    "patterns": [...], "readings": [...], "settings": {...},
    "attachments": [{ "id": "...", "patternId": "...", "mimeType": "image/jpeg", "base64": "..." }]
  }
  ```

- **Restaurar backup:** escolher o arquivo → validar `app` e `schemaVersion` → confirmar ("Isso substituirá os dados atuais") → limpar e inserir tudo em **uma transação** → regravar os anexos → reagendar notificações.
- **Lembrete mensal de backup** (notificação local) e aviso âmbar no Histórico quando o último backup tiver mais de 30 dias.
- Os backups de aparelho (iCloud no iOS, backup do Google no Android) podem incluir o banco, mas **não confiar nisso** no MVP.

### 13.7 Exportação e importação

- **PDF (laudo):** montar HTML com resumo do período, tabela de leituras e gráfico em SVG inline → `Print.printToFileAsync({ html })` → `Sharing.shareAsync(uri)`. O usuário escolhe enviar ao médico pelo WhatsApp, e-mail etc.
- **XLSX:** `XLSX.utils.json_to_sheet(readings)` → escrever em base64 no `cacheDirectory` → compartilhar.
- **Importar .xlsx/.csv:**
  1. Ler o arquivo e mapear as colunas (data/hora, valor, contexto, nota, insulina).
  2. Mostrar uma pré-visualização com o total de linhas válidas e inválidas.
  3. Inserir em transação com `source = 'import'`.
  4. Ignorar duplicatas (mesmo `measured_at` + `value`).

### 13.8 Privacidade e segurança

- Dados de saúde ficam **só no aparelho** e nada é enviado para fora sem ação explícita do usuário (compartilhar ou exportar).
- O SQLite **não é criptografado** por padrão. Para o MVP, confiar na criptografia do próprio sistema (aparelho com senha). Evolução: SQLCipher ou bloqueio do app com biometria (`expo-local-authentication`).
- Excluir os arquivos temporários de exportação do `cacheDirectory` depois de compartilhar.
- Ajustes → **"Apagar todos os dados"**, com confirmação dupla: exclui o banco e a pasta de anexos e volta ao onboarding.

### 13.9 O que fica fora do MVP

| Funcionalidade nas telas | No MVP |
|---|---|
| "Sincronizado via Bluetooth", sensor contínuo (CGM) | Removido. Leituras são digitadas |
| "Salvando na nuvem…", "Sincronização em Tempo Real" | "Salvando…", "Salvo neste aparelho" |
| "Conectado via Mellitus Pro" (médico com conta) | Médico cadastrado manualmente como texto |
| Envio automático do laudo ao WhatsApp do médico | Lembrete local → gerar arquivo → compartilhar manualmente |
| Apple Health / Health Connect | Pós-MVP (card "Em breve") |
| Hash, assinatura digital, nº de protocolo no laudo | Removido (exige servidor) |
| Login / conta / multi-dispositivo | Não existe. Só o nome do usuário em `settings.profile` |
