/** Junta classes do NativeWind ignorando valores falsos: cn('p-md', isActive && 'bg-primary'). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
