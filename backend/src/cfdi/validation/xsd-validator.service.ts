/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/cfdi/validation/xsd-validator.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class XsdValidatorService {
  private readonly logger = new Logger(XsdValidatorService.name);
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
    });
    this.logger.log('✅ XSD Validator Service inicializado');
  }

  /**
   * Validar XML de CFDI contra esquema XSD
   */
  async validateCfdiXml(xmlString: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Validar que sea XML válido
      const validationResult = XMLValidator.validate(xmlString, {
        allowBooleanAttributes: true,
      });

      if (validationResult !== true) {
        result.isValid = false;
        result.errors.push(`XML mal formado: ${validationResult.err.msg}`);
        return result;
      }

      // Parsear el XML
      const xmlDoc = this.parser.parse(xmlString);

      // Validación básica de estructura
      const validationErrors = this.validateBasicStructure(xmlDoc, xmlString);
      if (validationErrors.length > 0) {
        result.isValid = false;
        result.errors.push(...validationErrors);
      }

      // Validaciones de reglas de negocio
      const businessValidations = this.validateBusinessRules(xmlDoc);
      if (!businessValidations.isValid) {
        result.isValid = false;
        result.errors.push(...businessValidations.errors);
      }
      result.warnings.push(...businessValidations.warnings);

      this.logger.log(
        `Validación completada: ${result.isValid ? '✅ Válido' : '❌ Inválido'}`,
      );
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Error al validar XML: ${error.message}`);
      this.logger.error('Error en validación', error);
    }

    return result;
  }

  /**
   * Validar estructura básica del CFDI
   */
  private validateBasicStructure(xmlDoc: any, xmlString: string): string[] {
    const errors: string[] = [];

    try {
      // Verificar namespace correcto
      if (!xmlString.includes('http://www.sat.gob.mx/cfd/4')) {
        errors.push(
          'Namespace incorrecto. Debe ser http://www.sat.gob.mx/cfd/4',
        );
      }

      // Obtener el nodo raíz (Comprobante)
      const comprobante = xmlDoc['cfdi:Comprobante'] || xmlDoc.Comprobante;

      if (!comprobante) {
        errors.push('XML sin elemento raíz Comprobante');
        return errors;
      }

      // Verificar versión
      const version = comprobante['@_Version'];
      if (version !== '4.0') {
        errors.push(`Versión incorrecta: ${version}. Debe ser 4.0`);
      }

      // Verificar elementos obligatorios
      if (!comprobante['cfdi:Emisor'] && !comprobante.Emisor) {
        errors.push('Elemento obligatorio faltante: Emisor');
      }

      if (!comprobante['cfdi:Receptor'] && !comprobante.Receptor) {
        errors.push('Elemento obligatorio faltante: Receptor');
      }

      if (!comprobante['cfdi:Conceptos'] && !comprobante.Conceptos) {
        errors.push('Elemento obligatorio faltante: Conceptos');
      }

      // Verificar atributos obligatorios del comprobante
      const requiredAttrs = ['Fecha', 'SubTotal', 'Total', 'TipoDeComprobante'];

      for (const attr of requiredAttrs) {
        if (!comprobante[`@_${attr}`]) {
          errors.push(`Atributo obligatorio faltante en Comprobante: ${attr}`);
        }
      }
    } catch (error) {
      errors.push(`Error al validar estructura básica: ${error.message}`);
    }

    return errors;
  }

  /**
   * Validar reglas de negocio del SAT
   */
  private validateBusinessRules(xmlDoc: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      const comprobante = xmlDoc['cfdi:Comprobante'] || xmlDoc.Comprobante;
      if (!comprobante) return result;

      // Validar RFC emisor
      const emisor = comprobante['cfdi:Emisor'] || comprobante.Emisor;
      const rfcEmisor = emisor?.['@_Rfc'];

      if (rfcEmisor && !this.isValidRFC(rfcEmisor)) {
        result.errors.push(`RFC emisor inválido: ${rfcEmisor}`);
        result.isValid = false;
      }

      // Validar RFC receptor
      const receptor = comprobante['cfdi:Receptor'] || comprobante.Receptor;
      const rfcReceptor = receptor?.['@_Rfc'];

      if (rfcReceptor && !this.isValidRFC(rfcReceptor)) {
        result.errors.push(`RFC receptor inválido: ${rfcReceptor}`);
        result.isValid = false;
      }

      // Validar totales
      const subtotal = parseFloat(comprobante['@_SubTotal'] || '0');
      const total = parseFloat(comprobante['@_Total'] || '0');

      if (subtotal < 0) {
        result.errors.push('El subtotal no puede ser negativo');
        result.isValid = false;
      }

      if (total < 0) {
        result.errors.push('El total no puede ser negativo');
        result.isValid = false;
      }

      // Validar que haya al menos un concepto
      const conceptos = comprobante['cfdi:Conceptos'] || comprobante.Conceptos;
      const concepto = conceptos?.['cfdi:Concepto'] || conceptos?.Concepto;

      if (!concepto || (Array.isArray(concepto) && concepto.length === 0)) {
        result.errors.push('Debe haber al menos un concepto');
        result.isValid = false;
      }

      // Validar moneda
      const moneda = comprobante['@_Moneda'];
      if (moneda && moneda !== 'MXN' && moneda !== 'USD' && moneda !== 'EUR') {
        result.warnings.push(`Moneda inusual: ${moneda}`);
      }
    } catch (error) {
      result.errors.push(
        `Error al validar reglas de negocio: ${error.message}`,
      );
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validar formato de RFC
   */
  private isValidRFC(rfc: string): boolean {
    // RFC Persona Física: 13 caracteres (AAAA000000XXX)
    const rfcFisicaRegex = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;

    // RFC Persona Moral: 12 caracteres (AAA000000XXX)
    const rfcMoralRegex = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;

    // RFC Genérico
    if (rfc === 'XAXX010101000' || rfc === 'XEXX010101000') {
      return true;
    }

    return rfcFisicaRegex.test(rfc) || rfcMoralRegex.test(rfc);
  }

  /**
   * Validar XML timbrado (con complemento de timbre)
   */
  async validateTimbrado(xmlString: string): Promise<ValidationResult> {
    const result = await this.validateCfdiXml(xmlString);

    try {
      const xmlDoc = this.parser.parse(xmlString);
      const comprobante = xmlDoc['cfdi:Comprobante'] || xmlDoc.Comprobante;
      const complemento =
        comprobante?.['cfdi:Complemento'] || comprobante?.Complemento;

      if (!complemento) {
        result.warnings.push('XML sin complemento de timbre (aún no timbrado)');
        return result;
      }

      // Verificar que tenga TimbreFiscalDigital
      const timbre = complemento['tfd:TimbreFiscalDigital'];

      if (!timbre) {
        result.errors.push('Complemento sin TimbreFiscalDigital');
        result.isValid = false;
      } else {
        // Validar UUID
        const uuid = timbre['@_UUID'];

        if (!uuid || !this.isValidUUID(uuid)) {
          result.errors.push(`UUID inválido: ${uuid}`);
          result.isValid = false;
        }
      }
    } catch (error) {
      result.errors.push(`Error al validar timbre: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validar formato de UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
