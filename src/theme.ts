export const theme = {
  brand: '#0B3B8C',
  brandDark: '#082A66',
  ink: '#101828',
  body: '#475467',
  muted: '#98A2B3',
  line: '#E4E7EC',
  surface: '#F8FAFC',
  danger: '#B42318',
  ok: '#067647',
} as const;

export const spacing = (n: number): number => n * 8;
