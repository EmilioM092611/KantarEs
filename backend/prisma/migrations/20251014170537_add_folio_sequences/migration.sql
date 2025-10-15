-- Crear secuencias para folios atómicos
CREATE SEQUENCE IF NOT EXISTS seq_folio_orden START 1;
CREATE SEQUENCE IF NOT EXISTS seq_folio_pago START 1;
CREATE SEQUENCE IF NOT EXISTS seq_folio_corte START 1;
CREATE SEQUENCE IF NOT EXISTS seq_folio_compra START 1;

-- Comentario de documentación
COMMENT ON SEQUENCE seq_folio_orden IS 'Secuencia para generar folios únicos de órdenes';
COMMENT ON SEQUENCE seq_folio_pago IS 'Secuencia para generar folios únicos de pagos';
COMMENT ON SEQUENCE seq_folio_corte IS 'Secuencia para generar folios únicos de cortes de caja';
COMMENT ON SEQUENCE seq_folio_compra IS 'Secuencia para generar folios únicos de compras';