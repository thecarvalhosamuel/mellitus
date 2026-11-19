# CLAUDE.md — Mellitus

App mobile de **monitoramento glicêmico** para pessoas com diabetes: registro manual de glicemia, metas clínicas configuráveis, ciclos de medição (ex.: alternado 3x/1x), lembretes, histórico e exportação de relatórios.

- Interface em **pt-BR**. Código, pastas e nomes de arquivos em **inglês**.
- **MVP 100% offline:** todos os dados ficam no aparelho. Sem backend, login, nuvem ou Bluetooth.
- Especificação completa: **`DESIGN.md`**. Consulte-o antes de criar telas ou componentes.



## Convenções obrigatórias

1. **Todo componente é uma pasta camelCase com `index.tsx`**: `glucoseChart/index.tsx` → `export function GlucoseChart`.
   - Arquivos opcionais: `styles.ts` (mapas de variantes de classes), `types.ts`, `useNomeComponente.ts`, `components/` (subcomponentes privados).
   - Vale também para hooks, utils, types, theme e repositórios (`nome/index.ts`).
   - Exceção: `_layout.tsx` do Expo Router.
2. **Arquivos de rota** só reexportam a tela: `export { HomeScreen as default } from '@/screens/home';`
3. **Onde colocar componentes:**
   - Usado em 2+ telas ou primitivo de UI → `src/components/…` (`layout/`, `ui/`, `glucose/`)
   - Usado em uma tela → `src/screens/<tela>/components/…`
   - Usado só por outro componente → `<componente>/components/…`
   - Passou a ser reutilizado → **mover** para `src/components` (nunca duplicar).
   - `src/shared/` não tem componentes: só `hooks`, `theme`, `utils`, `types`, `constants`.
4. **Uma responsabilidade por componente.** Limite indicativo de ~150 linhas por `index.tsx`; acima disso, extrair subcomponentes ou hook.
5. **Telas só compõem seções** e conectam dados (store/hook). Sem estilização detalhada nelas.
6. **Componentes de UI recebem dados por props** e nunca acessam store nem banco.
7. **Lógica fora do JSX:** regras de glicemia, ciclo e estatísticas em `shared/utils` ou hooks.
8. **Estilo com NativeWind + tokens semânticos. Nunca usar hex direto** nem cores da paleta padrão do Tailwind (`bg-teal-600`).
   - Padrão: `className` com classes semânticas (`bg-card`, `text-muted`, `bg-status-in-range-bg`, `rounded-card`).
   - Onde `className` não se aplica (SVG, `expo-linear-gradient`, `expo-blur`, navegação, Reanimated): `const { colors } = useTheme()` com as mesmas chaves.
   - Fonte única dos tokens: `src/shared/theme` → gera as variáveis CSS do NativeWind e alimenta o `useTheme()`.
9. Imports com alias `@/` (→ `src/`). Componentes exportados com named export.
10. Não fragmentar sem motivo: trecho pequeno, sem lógica e sem reuso pode ficar no próprio componente.

## Fluxo de dados

```
Tela → hook → store (zustand) → repository → SQLite
```

- **Só os repositórios executam SQL** (`src/database/repositories/*`).
- Init em `src/app/_layout.tsx`: splash → abrir banco → migrations → seed → carregar padrão ativo e settings → esconder splash.
- Gravação otimista no store; em erro, reverter e mostrar toast.
- Histórico consultado **por mês** (não carregar tudo na memória).
- Escritas em várias tabelas usam `withTransactionAsync`.


## Regras de negócio (glicemia)

A classificação usa a meta do **padrão ativo** para o contexto da leitura (jejum/pré-prandial, pós-prandial, ao deitar):

| Status | Condição | Rótulo | Cor |
|---|---|---|---|
| `severe-hypo` | < 54 | Hipo Severa | crimson + halo |
| `hypo` | < alerta hipo (padrão 70) | Hipo Leve | crimson |
| `below-target` | < mínimo e ≥ alerta hipo | Abaixo da Meta | âmbar |
| `in-range` | dentro da faixa | No Alvo | verde |
| `above-target` | > máximo e ≤ alerta hiper | Acima da Meta | âmbar |
| `severe-hyper` | > alerta hiper (padrão 200) | Hiper Severa | crimson + halo |

- **Identificadores (enums, chaves, valores no banco) sempre em inglês**; o rótulo pt-BR fica só na UI/constantes. Momentos (`MealContext`): `fasting`, `pre-meal`, `post-meal-1h`, `post-meal-2h`, `pre-dinner`, `post-dinner`, `bedtime`, `overnight`, `other`. Frequências (`FrequencyMode`): `3x`, `1x`, `alternating`, `every-other-day`, `every-72h`, `custom`.

- **Nenhuma meta fixa na UI:** badges, "Meta: 80–130", faixa do gráfico e barras vêm do padrão ativo (ou da meta gravada na leitura).
- **Ciclo alternado:** `diasDesde(cycleStart) % 2 === 0 ? 'A' : 'B'`. Dia A = 3 medições; Dia B = 1 (jejum).
- **TIR (% no alvo)** = leituras `in-range` / total do período. Meta > 70%.
- Entrada manual limitada a 40–450 mg/dL. O banco aceita 20–600 (importação).
- Valores clínicos padrão são exemplos e **precisam de validação profissional**.

## Design system (resumo — detalhes em DESIGN.md)

- Temas **claro e escuro** com as mesmas chaves semânticas (`bg`, `card`, `inset`, `control`, `text`, `textMuted`, `primary`, `status.*`…). Troca: sistema / claro / escuro (`settings.appearance`).
- **Claro:** canvas `#FAF8FF`, card `#FFFFFF`, sub-bloco `#F2F3FF`, texto `#131B2E`, primary `#00685F`.
- **Escuro:** canvas `#051424`, card `#0D1C2D` + borda `#1E334A`, sub-bloco `#081726`, texto `#D4E4FA`, metadados `#94A3B8`, primary `#4FDBC8`.
- **Status nos dois temas:** verde = no alvo · âmbar = fora da meta · crimson = perigo.
  - A direção é indicada por seta e texto, nunca só por cor.
  - Crimson **nunca** é decorativo.
- CTA principal: claro = sólido `#00685F` com texto branco; escuro = gradiente `#0D9488 → #14B8A6` com **texto `#051424`**.
- Tipografia: Plus Jakarta Sans. Glicemia em `display-numeric` 44/48 bold. **Números sempre com `fontVariant: ['tabular-nums']`.**
- Raios: inputs/botões 8 · CTA/dropdown 12 · **cards 16** · bottom sheet 24 (topo) · badges pill.
- Espaçamento base 4/8/16/24/32; margem de tela 16.
- Toast: `inverse-surface` nos dois temas, com ícone colorido pelo resultado.
- Avatar: inicial do nome salvo em `settings.profile` (sem foto).

## Acessibilidade

- Alvos de toque ≥ 44 (ideal 48).
- Contraste AA verificado.
- `accessibilityLabel` em botões só com ícone; `accessibilityRole`/`accessibilityState` em radios e switches.
- Suportar escala de fonte do sistema.

## Fora do MVP (não implementar)

- Login/conta, sincronização em nuvem, multi-dispositivo
- Glicosímetro Bluetooth / sensor contínuo (CGM)
- Apple Health / Health Connect (mostrar "Em breve")
- Envio automático de laudo; hash, assinatura digital ou protocolo no PDF
- Médico "conectado" (cadastro é manual, só texto)

## Ao trabalhar neste projeto

- Leia a seção relevante do `DESIGN.md` antes de implementar uma tela ou componente.
- Antes de criar componente novo, verifique se já existe algo equivalente em `src/components`.
- Escreva testes para regras em `shared/utils` (classificação, ciclo, estatísticas).
- Rode `npx tsc --noEmit` e os testes antes de concluir uma tarefa.
- Instale libs nativas com `npx expo install`, não com `npm i`.
- Não alterar valores clínicos padrão sem pedido explícito.
- Textos da interface em pt-BR, com tom calmo e empático (sem alarmismo).
