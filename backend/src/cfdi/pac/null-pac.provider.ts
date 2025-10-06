import { PacProvider } from './pac.provider';

function randomUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class NullPacProvider implements PacProvider {
  async timbrar(payload: any) {
    const uuid = randomUUID();
    const xml = `<cfdi:Comprobante Serie="${payload.serie ?? ''}" Folio="${payload.folio ?? ''}" Total="${payload.total ?? 0}"><cfdi:Complemento><tfd:TimbreFiscalDigital UUID="${uuid}"/></cfdi:Complemento></cfdi:Comprobante>`;
    return { uuid, xml };
  }
  async cancelar(uuid: string) {
    return { ok: true };
  }
}
