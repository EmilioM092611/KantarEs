/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PacProvider } from './pac.provider';

@Injectable()
export class RealPacProvider implements PacProvider {
  constructor(private readonly http: HttpService) {}

  async timbrar(payload: { xml: string }) {
    const url = process.env.PAC_TIMBRAR_URL!;
    const user = process.env.PAC_USER!;
    const pass = process.env.PAC_PASS!;
    if (!url || !user || !pass) throw new Error('Config PAC incompleta');

    const body = {
      usuario: user,
      password: pass,
      xml_b64: Buffer.from(payload.xml, 'utf8').toString('base64'),
    };

    const resp = await lastValueFrom(
      this.http.post(url, body, { timeout: 15000 }),
    );
    const data = resp.data || {};
    const uuid: string = data.uuid || data.UUID || data?.timbre?.uuid;
    const xmlTimbrado: string = data.xml || data.XML || data?.xmlTimbrado;
    if (!uuid || !xmlTimbrado)
      throw new Error(
        data.mensaje || data.error || 'Respuesta de PAC inválida',
      );
    return { uuid, xml: xmlTimbrado };
  }

  async cancelar(
    uuid: string,
    dto?: { motivo?: string; uuid_relacionado?: string },
  ) {
    const url = process.env.PAC_CANCELAR_URL!;
    const user = process.env.PAC_USER!;
    const pass = process.env.PAC_PASS!;
    const rfc = process.env.PAC_RFC_EMISOR!;
    if (!url || !user || !pass || !rfc)
      throw new Error('Config PAC incompleta');

    const body: any = {
      usuario: user,
      password: pass,
      rfcEmisor: rfc,
      uuid,
      motivo: dto?.motivo ?? '02',
    };
    if (dto?.uuid_relacionado) body.uuidSustitucion = dto.uuid_relacionado;

    const resp = await lastValueFrom(
      this.http.post(url, body, { timeout: 15000 }),
    );
    const data = resp.data || {};
    const ok = !!(
      data.ok ??
      data.exito ??
      data.success ??
      data.estatus === 'cancelado'
    );
    const acuse: string =
      data.acuse || data.acuse_cancelacion || data?.xmlAcuse || '';
    if (!ok)
      throw new Error(data.mensaje || data.error || 'PAC no canceló el CFDI');
    return { ok: true, acuse };
  }
}
