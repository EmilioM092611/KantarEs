// backend/src/cfdi/catalogos/catalogos.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as regimenFiscal from './data/regimenes-fiscales.json';
import * as usoCfdi from './data/uso-cfdi.json';
import * as formasPago from './data/formas-pago.json';
import * as metodosPago from './data/metodos-pago.json';
import * as tipoComprobante from './data/tipo-comprobante.json';
import * as monedas from './data/monedas.json';

export interface CatalogoItem {
  clave: string;
  descripcion: string;
  fisica?: boolean;
  moral?: boolean;
  vigencia_desde?: string;
  vigencia_hasta?: string | null;
}

@Injectable()
export class CatalogosService {
  private readonly logger = new Logger(CatalogosService.name);

  constructor() {
    this.logger.log('📚 Catálogos del SAT cargados exitosamente');
  }

  // ============================================
  // REGÍMENES FISCALES (c_RegimenFiscal)
  // ============================================

  /**
   * Obtener todos los regímenes fiscales
   */
  getRegimenesFiscales(soloVigentes = true): CatalogoItem[] {
    const catalogoCompleto = regimenFiscal as CatalogoItem[];

    if (!soloVigentes) {
      return catalogoCompleto;
    }

    return catalogoCompleto.filter((item) => {
      if (item.vigencia_hasta === null) return true; // Vigente indefinidamente
      if (!item.vigencia_hasta) return true;
      return new Date(item.vigencia_hasta) > new Date();
    });
  }

  /**
   * Obtener regímenes fiscales para personas físicas
   */
  getRegimenesFisicasFiscales(): CatalogoItem[] {
    return this.getRegimenesFiscales().filter((r) => r.fisica === true);
  }

  /**
   * Obtener regímenes fiscales para personas morales
   */
  getRegimenesMoralesFiscales(): CatalogoItem[] {
    return this.getRegimenesFiscales().filter((r) => r.moral === true);
  }

  /**
   * Buscar régimen fiscal por clave
   */
  getRegimenFiscal(clave: string): CatalogoItem {
    const item = this.getRegimenesFiscales().find((r) => r.clave === clave);

    if (!item) {
      throw new NotFoundException(
        `Régimen fiscal "${clave}" no encontrado o no vigente`,
      );
    }

    return item;
  }

  // ============================================
  // USO DE CFDI (c_UsoCFDI)
  // ============================================

  /**
   * Obtener todos los usos de CFDI
   */
  getUsosCfdi(soloVigentes = true): CatalogoItem[] {
    const catalogoCompleto = usoCfdi as CatalogoItem[];

    if (!soloVigentes) {
      return catalogoCompleto;
    }

    return catalogoCompleto.filter((item) => {
      if (item.vigencia_hasta === null) return true;
      if (!item.vigencia_hasta) return true;
      return new Date(item.vigencia_hasta) > new Date();
    });
  }

  /**
   * Obtener usos de CFDI para personas físicas
   */
  getUsosCfdiFisicas(): CatalogoItem[] {
    return this.getUsosCfdi().filter((u) => u.fisica === true);
  }

  /**
   * Obtener usos de CFDI para personas morales
   */
  getUsosCfdiMorales(): CatalogoItem[] {
    return this.getUsosCfdi().filter((u) => u.moral === true);
  }

  /**
   * Buscar uso de CFDI por clave
   */
  getUsoCfdi(clave: string): CatalogoItem {
    const item = this.getUsosCfdi().find((u) => u.clave === clave);

    if (!item) {
      throw new NotFoundException(
        `Uso de CFDI "${clave}" no encontrado o no vigente`,
      );
    }

    return item;
  }

  // ============================================
  // FORMAS DE PAGO (c_FormaPago)
  // ============================================

  /**
   * Obtener todas las formas de pago
   */
  getFormasPago(soloVigentes = true): CatalogoItem[] {
    const catalogoCompleto = formasPago as CatalogoItem[];

    if (!soloVigentes) {
      return catalogoCompleto;
    }

    return catalogoCompleto.filter((item) => {
      if (item.vigencia_hasta === null) return true;
      if (!item.vigencia_hasta) return true;
      return new Date(item.vigencia_hasta) > new Date();
    });
  }

  /**
   * Buscar forma de pago por clave
   */
  getFormaPago(clave: string): CatalogoItem {
    const item = this.getFormasPago().find((f) => f.clave === clave);

    if (!item) {
      throw new NotFoundException(
        `Forma de pago "${clave}" no encontrada o no vigente`,
      );
    }

    return item;
  }

  // ============================================
  // MÉTODOS DE PAGO (c_MetodoPago)
  // ============================================

  /**
   * Obtener todos los métodos de pago
   */
  getMetodosPago(): CatalogoItem[] {
    return metodosPago as CatalogoItem[];
  }

  /**
   * Buscar método de pago por clave
   */
  getMetodoPago(clave: string): CatalogoItem {
    const item = this.getMetodosPago().find((m) => m.clave === clave);

    if (!item) {
      throw new NotFoundException(`Método de pago "${clave}" no encontrado`);
    }

    return item;
  }

  // ============================================
  // TIPO DE COMPROBANTE (c_TipoDeComprobante)
  // ============================================

  /**
   * Obtener todos los tipos de comprobante
   */
  getTiposComprobante(): CatalogoItem[] {
    return tipoComprobante as CatalogoItem[];
  }

  /**
   * Buscar tipo de comprobante por clave
   */
  getTipoComprobante(clave: string): CatalogoItem {
    const item = this.getTiposComprobante().find((t) => t.clave === clave);

    if (!item) {
      throw new NotFoundException(
        `Tipo de comprobante "${clave}" no encontrado`,
      );
    }

    return item;
  }

  // ============================================
  // MONEDAS (c_Moneda)
  // ============================================

  /**
   * Obtener todas las monedas
   */
  getMonedas(soloVigentes = true): CatalogoItem[] {
    const catalogoCompleto = monedas as CatalogoItem[];

    if (!soloVigentes) {
      return catalogoCompleto;
    }

    return catalogoCompleto.filter((item) => {
      if (item.vigencia_hasta === null) return true;
      if (!item.vigencia_hasta) return true;
      return new Date(item.vigencia_hasta) > new Date();
    });
  }

  /**
   * Buscar moneda por clave
   */
  getMoneda(clave: string): CatalogoItem {
    const item = this.getMonedas().find((m) => m.clave === clave);

    if (!item) {
      throw new NotFoundException(
        `Moneda "${clave}" no encontrada o no vigente`,
      );
    }

    return item;
  }

  // ============================================
  // BÚSQUEDA GENERAL
  // ============================================

  /**
   * Buscar en cualquier catálogo por texto
   */
  buscarEnCatalogo(
    catalogo:
      | 'regimen'
      | 'uso'
      | 'forma_pago'
      | 'metodo_pago'
      | 'tipo_comprobante'
      | 'moneda',
    busqueda: string,
  ): CatalogoItem[] {
    const textoBusqueda = busqueda.toLowerCase().trim();

    let items: CatalogoItem[] = [];

    switch (catalogo) {
      case 'regimen':
        items = this.getRegimenesFiscales();
        break;
      case 'uso':
        items = this.getUsosCfdi();
        break;
      case 'forma_pago':
        items = this.getFormasPago();
        break;
      case 'metodo_pago':
        items = this.getMetodosPago();
        break;
      case 'tipo_comprobante':
        items = this.getTiposComprobante();
        break;
      case 'moneda':
        items = this.getMonedas();
        break;
    }

    return items.filter(
      (item) =>
        item.clave.toLowerCase().includes(textoBusqueda) ||
        item.descripcion.toLowerCase().includes(textoBusqueda),
    );
  }

  // ============================================
  // VALIDACIÓN
  // ============================================

  /**
   * Validar que una clave exista en el catálogo
   */
  validarClave(
    catalogo:
      | 'regimen'
      | 'uso'
      | 'forma_pago'
      | 'metodo_pago'
      | 'tipo_comprobante'
      | 'moneda',
    clave: string,
  ): boolean {
    try {
      switch (catalogo) {
        case 'regimen':
          this.getRegimenFiscal(clave);
          break;
        case 'uso':
          this.getUsoCfdi(clave);
          break;
        case 'forma_pago':
          this.getFormaPago(clave);
          break;
        case 'metodo_pago':
          this.getMetodoPago(clave);
          break;
        case 'tipo_comprobante':
          this.getTipoComprobante(clave);
          break;
        case 'moneda':
          this.getMoneda(clave);
          break;
      }
      return true;
    } catch {
      return false;
    }
  }
}
