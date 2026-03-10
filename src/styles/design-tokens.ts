// Design Tokens — shared constants for consistent styling across components
// Use these instead of hardcoded values in component classNames

export const radius = {
  sm: 'rounded-lg',      // 8px — inputs, chips, tags
  md: 'rounded-xl',      // 12px — cards, panels
  lg: 'rounded-2xl',     // 16px — modals, large cards
  xl: 'rounded-3xl',     // 24px — hero elements, avatars
  full: 'rounded-full',  // pills, badges, avatars
} as const;

export const shadow = {
  sm: 'shadow-elevation-1',
  md: 'shadow-elevation-2',
  lg: 'shadow-elevation-3',
  xl: 'shadow-elevation-4',
} as const;

export const glass = {
  panel: 'glass-panel',
  elevated: 'glass-panel-elevated',
  input: 'glass-input',
} as const;

export const fontSize = {
  xs: 'text-[11px]',
  sm: 'text-[13px]',
  base: 'text-[15px]',
  lg: 'text-[17px]',
  xl: 'text-[20px]',
  '2xl': 'text-[24px]',
  '3xl': 'text-[30px]',
  '4xl': 'text-[36px]',
  '5xl': 'text-[48px]',
} as const;

export const transition = {
  fast: 'transition-all duration-150 ease-out',
  base: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-300 ease-out',
  spring: 'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
} as const;

/** Common button-style presets */
export const buttonStyles = {
  ghost: 'p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors duration-200',
  ghostDanger: 'p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200',
  primary: 'px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors duration-200 shadow-lg shadow-accent/20',
  secondary: 'px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 border border-white/[0.08] rounded-xl font-medium transition-colors duration-200',
} as const;
