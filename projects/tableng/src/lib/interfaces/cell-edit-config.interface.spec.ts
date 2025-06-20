import { CellEditConfig, EditType } from './cell-edit-config.interface';

describe('CellEditConfig Interface', () => {
  describe('Type Structure', () => {
    it('should allow a minimal valid edit config', () => {
      const config: CellEditConfig = {
        type: 'text'
      };
      
      expect(config.type).toBe('text');
    });

    it('should allow a complete edit config with all properties', () => {
      const config: CellEditConfig = {
        type: 'select',
        required: true,
        placeholder: 'Select an option',
        options: ['Option 1', 'Option 2', 'Option 3'],
        validation: {
          minLength: 1,
          maxLength: 100,
          pattern: /^[A-Za-z]+$/,
          customValidator: (value: unknown) => value !== null
        },
        disabled: false,
        readonly: false
      };

      expect(config.type).toBe('select');
      expect(config.required).toBe(true);
      expect(config.placeholder).toBe('Select an option');
      expect(config.options).toEqual(['Option 1', 'Option 2', 'Option 3']);
      expect(config.validation?.minLength).toBe(1);
      expect(config.validation?.maxLength).toBe(100);
      expect(config.disabled).toBe(false);
      expect(config.readonly).toBe(false);
    });
  });

  describe('Edit Types', () => {
    it('should support all edit types', () => {
      const textConfig: CellEditConfig = { type: 'text' };
      const numberConfig: CellEditConfig = { type: 'number' };
      const dateConfig: CellEditConfig = { type: 'date' };
      const selectConfig: CellEditConfig = { type: 'select' };
      const checkboxConfig: CellEditConfig = { type: 'checkbox' };
      const customConfig: CellEditConfig = { type: 'custom' };

      expect(textConfig.type).toBe('text');
      expect(numberConfig.type).toBe('number');
      expect(dateConfig.type).toBe('date');
      expect(selectConfig.type).toBe('select');
      expect(checkboxConfig.type).toBe('checkbox');
      expect(customConfig.type).toBe('custom');
    });
  });

  describe('Options Property', () => {
    it('should allow string array options', () => {
      const config: CellEditConfig = {
        type: 'select',
        options: ['Red', 'Green', 'Blue']
      };

      expect(config.options).toEqual(['Red', 'Green', 'Blue']);
    });

    it('should allow object array options', () => {
      const config: CellEditConfig = {
        type: 'select',
        options: [
          { value: 'red', label: 'Red Color' },
          { value: 'green', label: 'Green Color' }
        ]
      };

      expect(config.options!.length).toBe(2);
      expect(config.options![0]).toEqual({ value: 'red', label: 'Red Color' });
    });
  });

  describe('Validation Property', () => {
    it('should allow partial validation rules', () => {
      const config: CellEditConfig = {
        type: 'text',
        validation: {
          minLength: 5,
          required: true
        }
      };

      expect(config.validation?.minLength).toBe(5);
      expect(config.validation?.required).toBe(true);
      expect(config.validation?.maxLength).toBeUndefined();
    });

    it('should allow custom validator function', () => {
      const customValidator = (value: unknown): boolean => {
        return typeof value === 'string' && value.length > 0;
      };

      const config: CellEditConfig = {
        type: 'text',
        validation: {
          customValidator: customValidator
        }
      };

      expect(config.validation?.customValidator).toBe(customValidator);
      expect(config.validation?.customValidator!('test')).toBe(true);
      expect(config.validation?.customValidator!('')).toBe(false);
    });

    it('should allow regex pattern validation', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const config: CellEditConfig = {
        type: 'text',
        validation: {
          pattern: emailPattern
        }
      };

      expect(config.validation?.pattern).toBe(emailPattern);
    });
  });

  describe('Required Properties', () => {
    it('should require type property', () => {
      const config: CellEditConfig = {
        type: 'text'
      };

      expect(config.type).toBeDefined();
      expect(typeof config.type).toBe('string');
    });
  });

  describe('Validation Logic', () => {
    it('should validate select type requires options', () => {
      const isValidSelectConfig = (config: CellEditConfig): boolean => {
        return config.type !== 'select' || Boolean(config.options && config.options.length > 0);
      };

      const validSelect: CellEditConfig = { type: 'select', options: ['A', 'B'] };
      const invalidSelect: CellEditConfig = { type: 'select' };
      const textConfig: CellEditConfig = { type: 'text' };

      expect(isValidSelectConfig(validSelect)).toBe(true);
      expect(isValidSelectConfig(invalidSelect)).toBe(false);
      expect(isValidSelectConfig(textConfig)).toBe(true);
    });

    it('should validate length constraints', () => {
      const isValidLengthConstraints = (config: CellEditConfig): boolean => {
        const { validation } = config;
        if (!validation) return true;
        
        const { minLength, maxLength } = validation;
        if (minLength && maxLength && minLength > maxLength) return false;
        if (minLength && minLength < 0) return false;
        if (maxLength && maxLength < 0) return false;
        
        return true;
      };

      const validConfig: CellEditConfig = {
        type: 'text',
        validation: { minLength: 1, maxLength: 10 }
      };
      
      const invalidConfig: CellEditConfig = {
        type: 'text',
        validation: { minLength: 10, maxLength: 5 }
      };

      expect(isValidLengthConstraints(validConfig)).toBe(true);
      expect(isValidLengthConstraints(invalidConfig)).toBe(false);
    });
  });
}); 