// Token/interfaz del PAC
export abstract class PacProvider {
  abstract timbrar(payload: {
    xml: string;
    [k: string]: any;
  }): Promise<{ uuid: string; xml: string }>;
  abstract cancelar(
    uuid: string,
    dto?: { motivo?: string; uuid_relacionado?: string },
  ): Promise<{ ok: boolean; acuse?: string }>;
}
