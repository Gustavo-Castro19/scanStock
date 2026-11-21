import { Platform } from 'react-native';

export const Palette = {
  primary: '#0F7A6B',
  primaryDark: '#0B5A4F',
  primaryLight: '#DDF3EC',
  reticle: '#3DDBB8',
  reticleDark: '#06231D',

  darkBg: '#0E1211',
  darkSurface: '#222927',
  darkText: '#14171A',

  subtitle: '#4A5551',
  muted: '#6B7772',
  description: '#33403B',

  lightBg: '#F6F7F5',
  lightSurface: '#F0F3F1',
  card: '#FFFFFF',

  border: '#E1E6E3',
  inputBorder: '#D3D9D6',

  warningBg: '#FDEBD0',
  warningText: '#7A4A00',
  warningDot: '#C77700',
  noticeBg: '#FFF6E8',

  dangerBg: '#F6DDDD',
  dangerText: '#8A2424',
  dangerDot: '#8A2424',

  successBg: '#DDF3EC',
  successText: '#0B5A4F',
  successDot: '#0F7A6B',

  livros: '#2C5B52',
  laboratorio: '#3A4A57',
  laboratorioAlt: '#5B4B6B',
  estoque: '#8A6A3A',
  estoqueAlt: '#A7743A',
};

export const Colors = {
  light: {
    text: Palette.darkText,
    background: Palette.lightBg,
    card: Palette.card,
    backgroundElement: Palette.lightSurface,
    backgroundSelected: Palette.border,
    textSecondary: Palette.subtitle,
    primary: Palette.primary,
    border: Palette.border,
  },
  dark: {
    text: '#FFFFFF',
    background: Palette.darkBg,
    card: Palette.darkSurface,
    backgroundElement: '#1F2422',
    backgroundSelected: '#2A302E',
    textSecondary: '#B8C2BE',
    primary: Palette.reticle,
    border: '#2E3633',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'system-ui, sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
