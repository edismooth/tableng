/**
 * Color scheme for table theming
 */
export interface ThemeColors {
  /** Primary color */
  primary?: string;
  /** Secondary color */
  secondary?: string;
  /** Background color */
  background?: string;
  /** Surface color */
  surface?: string;
  /** Primary text color */
  text?: string;
  /** Secondary text color */
  textSecondary?: string;
  /** Border color */
  border?: string;
  /** Hover state color */
  hover?: string;
  /** Selected state color */
  selected?: string;
  /** Error color */
  error?: string;
  /** Warning color */
  warning?: string;
  /** Success color */
  success?: string;
}

/**
 * Typography configuration for table theming
 */
export interface ThemeTypography {
  /** Font family */
  fontFamily?: string;
  /** Base font size */
  fontSize?: string;
  /** Font weight */
  fontWeight?: string;
  /** Line height */
  lineHeight?: string;
  /** Header font size */
  headerFontSize?: string;
  /** Header font weight */
  headerFontWeight?: string;
}

/**
 * Spacing configuration for table theming
 */
export interface ThemeSpacing {
  /** Cell padding */
  cellPadding?: string;
  /** Header padding */
  headerPadding?: string;
  /** Row height */
  rowHeight?: string;
  /** Header height */
  headerHeight?: string;
}

/**
 * Shadow levels for visual depth
 */
export type ShadowLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * Complete theme configuration for table visual customization
 */
export interface TableTheme {
  /** Theme name */
  name: string;
  
  /** Color configuration */
  colors?: ThemeColors;
  
  /** Typography configuration */
  typography?: ThemeTypography;
  
  /** Spacing configuration */
  spacing?: ThemeSpacing;
  
  /** Border radius */
  borderRadius?: string;
  
  /** Border width */
  borderWidth?: string;
  
  /** Shadow level */
  shadowLevel?: ShadowLevel;
} 