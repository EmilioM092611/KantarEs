// src/cfdi/validation/validation-result.interface.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp?: Date;
  xmlLength?: number;
}

export interface DetailedValidationResult extends ValidationResult {
  structureValidation: ValidationResult;
  xsdValidation: ValidationResult;
  businessRulesValidation: ValidationResult;
  timbreValidation?: ValidationResult;
}
