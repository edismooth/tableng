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
        validators: [{
          type: 'minLength',
          validator: (value: string) => value.length >= 1,
          message: 'Minimum length 1 required.'
        }, {
          type: 'maxLength',
          validator: (value: string) => value.length <= 100,
          message: 'Maximum length 100 exceeded.'
        }, {
          type: 'pattern',
          validator: (value: string) => /^[A-Za-z]+$/.test(value),
          message: 'Only alphabets allowed.'
        }, {
          type: 'custom',
          validator: (value: unknown) => value !== null,
          message: 'Value cannot be null.'
        }],
        disabled: false,
        readonly: false
      };

      expect(config.type).toBe('select');
      expect(config.required).toBe(true);
      expect(config.placeholder).toBe('Select an option');
      expect(config.options).toEqual(['Option 1', 'Option 2', 'Option 3']);
      expect(config.validators?.length).toBe(4);
      expect(config.required).toBe(true);
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
        validators: [{
          type: 'minLength',
          validator: (value: string) => value.length >= 5,
          message: 'Minimum length 5 required.'
        }, {
          type: 'required',
          validator: (value: string) => !!value,
          message: 'Value is required.'
        }]
      };

      expect(config.validators?.length).toBe(2);
      expect(config.validators?.[0].type).toBe('minLength');
      expect(config.validators?.[1].type).toBe('required');
    });

    it('should allow custom validator function', () => {
      const customValidator = (value: unknown): boolean => {
        return typeof value === 'string' && value.length > 0;
      };

      const config: CellEditConfig = {
        type: 'text',
        validators: [{
          type: 'custom',
          validator: customValidator,
          message: 'Custom validation failed.'
        }]
      };

      expect(config.validators?.[0].validator).toBe(customValidator);
      expect(config.validators?.[0].validator('test')).toBe(true);
      expect(config.validators?.[0].validator('')).toBe(false);
    });

    it('should allow regex pattern validation', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const config: CellEditConfig = {
        type: 'text',
        validators: [{
          type: 'pattern',
          validator: (value: string) => emailPattern.test(value),
          message: 'Invalid email format.'
        }]
      };

      expect(config.validators?.[0].type).toBe('pattern');
      expect(config.validators?.[0].validator('test@example.com')).toBe(true);
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
        // Check if minLength and maxLength properties exist directly on config
        if (config.minLength !== undefined && config.maxLength !== undefined) {
          return config.minLength <= config.maxLength;
        }
        return true;
      };

      const validConfig: CellEditConfig = {
        type: 'text',
        minLength: 1,
        maxLength: 10
      };
      
      const invalidConfig: CellEditConfig = {
        type: 'text',
        minLength: 10,
        maxLength: 5
      };

      expect(isValidLengthConstraints(validConfig)).toBe(true);
      expect(isValidLengthConstraints(invalidConfig)).toBe(false);
    });
  });
}); 