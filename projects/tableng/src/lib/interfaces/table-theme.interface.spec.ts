import { TableTheme, ThemeColors, ThemeTypography, ThemeSpacing } from './table-theme.interface';

describe('TableTheme Interface', () => {
  describe('Type Structure', () => {
    it('should allow a minimal valid theme', () => {
      const theme: TableTheme = {
        name: 'minimal-theme'
      };
      
      expect(theme.name).toBe('minimal-theme');
    });

    it('should allow a complete theme with all properties', () => {
      const colors: ThemeColors = {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        hover: '#e9ecef',
        selected: '#e3f2fd',
        error: '#dc3545',
        warning: '#ffc107',
        success: '#28a745'
      };

      const typography: ThemeTypography = {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.5',
        headerFontSize: '16px',
        headerFontWeight: '600'
      };

      const spacing: ThemeSpacing = {
        cellPadding: '8px 12px',
        headerPadding: '12px',
        rowHeight: '40px',
        headerHeight: '48px'
      };

      const theme: TableTheme = {
        name: 'complete-theme',
        colors: colors,
        typography: typography,
        spacing: spacing,
        borderRadius: '4px',
        borderWidth: '1px',
        shadowLevel: 'medium'
      };

      expect(theme.name).toBe('complete-theme');
      expect(theme.colors).toBe(colors);
      expect(theme.typography).toBe(typography);
      expect(theme.spacing).toBe(spacing);
      expect(theme.borderRadius).toBe('4px');
      expect(theme.borderWidth).toBe('1px');
      expect(theme.shadowLevel).toBe('medium');
    });
  });

  describe('ThemeColors', () => {
    it('should allow partial color customization', () => {
      const colors: ThemeColors = {
        primary: '#custom-primary',
        background: '#custom-bg'
      };

      expect(colors.primary).toBe('#custom-primary');
      expect(colors.background).toBe('#custom-bg');
      expect(colors.secondary).toBeUndefined();
    });

    it('should support all color properties', () => {
      const colors: ThemeColors = {
        primary: '#1',
        secondary: '#2',
        background: '#3',
        surface: '#4',
        text: '#5',
        textSecondary: '#6',
        border: '#7',
        hover: '#8',
        selected: '#9',
        error: '#10',
        warning: '#11',
        success: '#12'
      };

      expect(Object.keys(colors).length).toBe(12);
    });
  });

  describe('ThemeTypography', () => {
    it('should allow partial typography customization', () => {
      const typography: ThemeTypography = {
        fontFamily: 'Custom Font',
        fontSize: '16px'
      };

      expect(typography.fontFamily).toBe('Custom Font');
      expect(typography.fontSize).toBe('16px');
      expect(typography.fontWeight).toBeUndefined();
    });
  });

  describe('ThemeSpacing', () => {
    it('should allow partial spacing customization', () => {
      const spacing: ThemeSpacing = {
        cellPadding: '10px',
        rowHeight: '50px'
      };

      expect(spacing.cellPadding).toBe('10px');
      expect(spacing.rowHeight).toBe('50px');
      expect(spacing.headerPadding).toBeUndefined();
    });
  });

  describe('Shadow Levels', () => {
    it('should support shadow level options', () => {
      const noneTheme: TableTheme = {
        name: 'none',
        shadowLevel: 'none'
      };

      const lowTheme: TableTheme = {
        name: 'low',
        shadowLevel: 'low'
      };

      const mediumTheme: TableTheme = {
        name: 'medium',
        shadowLevel: 'medium'
      };

      const highTheme: TableTheme = {
        name: 'high',
        shadowLevel: 'high'
      };

      expect(noneTheme.shadowLevel).toBe('none');
      expect(lowTheme.shadowLevel).toBe('low');
      expect(mediumTheme.shadowLevel).toBe('medium');
      expect(highTheme.shadowLevel).toBe('high');
    });
  });

  describe('Validation Logic', () => {
    it('should validate theme name is not empty', () => {
      const isValidThemeName = (name: string): boolean => {
        return name.length > 0 && name.trim().length > 0;
      };

      expect(isValidThemeName('valid-theme')).toBe(true);
      expect(isValidThemeName('')).toBe(false);
      expect(isValidThemeName('   ')).toBe(false);
    });

    it('should validate color format', () => {
      const isValidColor = (color: string): boolean => {
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        const namedColors = ['red', 'blue', 'green', 'white', 'black'];
        
        return hexPattern.test(color) || 
               rgbPattern.test(color) || 
               namedColors.includes(color.toLowerCase());
      };

      expect(isValidColor('#ff0000')).toBe(true);
      expect(isValidColor('#f00')).toBe(true);
      expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
      expect(isValidColor('red')).toBe(true);
      expect(isValidColor('invalid-color')).toBe(false);
    });
  });
}); 