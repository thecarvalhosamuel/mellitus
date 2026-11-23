import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export type ToastType = 'success' | 'error';

export type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
};

/** Duração na tela (DESIGN.md §7: 2,6–3,2 s). */
export const TOAST_DURATION_MS = 3000;

type ToastState = {
  current: ToastMessage | null;
  show(toast: Omit<ToastMessage, 'id'>): void;
  hide(): void;
};

let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;

const useToastStore = create<ToastState>()((set) => ({
  current: null,
  show(toast) {
    clearTimeout(timer);
    const id = nextId++;
    set({ current: { ...toast, id } });
    timer = setTimeout(() => set((s) => (s.current?.id === id ? { current: null } : s)), TOAST_DURATION_MS);
  },
  hide() {
    clearTimeout(timer);
    set({ current: null });
  },
}));

/** Disparar toasts de qualquer tela ou hook: `const toast = useToast(); toast.success('Salvo!')`. */
export function useToast() {
  const show = useToastStore((s) => s.show);
  return {
    success: (message: string, title?: string) => show({ type: 'success', message, title }),
    error: (message: string, title?: string) => show({ type: 'error', message, title }),
  };
}

/** Estado do toast atual, para o host no _layout repassar ao componente Toast. */
export function useToastState() {
  return useToastStore(useShallow((s) => ({ current: s.current, hide: s.hide })));
}

/** Fora de componentes (ex.: stores revertendo uma gravação). */
export const toast = {
  success: (message: string, title?: string) => useToastStore.getState().show({ type: 'success', message, title }),
  error: (message: string, title?: string) => useToastStore.getState().show({ type: 'error', message, title }),
};
