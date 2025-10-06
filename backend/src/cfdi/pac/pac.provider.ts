export abstract class PacProvider {
  abstract timbrar(payload: any): Promise<{ uuid: string; xml: string }>;
  abstract cancelar(uuid: string): Promise<{ ok: boolean }>;
}
