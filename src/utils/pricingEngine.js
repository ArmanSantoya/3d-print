import { calculateTrayDetails, roundTo50 } from './costCalculator';

/**
 * Calcula la cotización completa a partir de las bandejas y configuración.
 * Aplica el margen por bandeja (no sobre el total) para que las filas del PDF
 * sumen exactamente al subtotal mostrado al cliente.
 *
 * @param {Array}  trayData
 * @param {Object} config
 * @param {{ includeDesign?: boolean, applyRetention?: boolean }} options
 */
export const calculateQuote = (trayData, config, { includeDesign = false, applyRetention = true } = {}) => {
  const marginPercent = Number(config.margin) || 0;
  const retentionRate = Number(config.retentionRate) || 0.1525;
  const designFeeValue = includeDesign ? Number(config.designFee ?? 5000) : 0;

  const trayRows = trayData.map((tray, i) => {
    const breakdown = calculateTrayDetails(tray, config);
    return {
      name: tray.name || `Bandeja ${i + 1}`,
      weight: Number(tray.weight) || 0,
      material: tray.material || '',
      printer: tray.printer || '',
      ...breakdown,
      priceWithMargin: Math.round(breakdown.subtotal * (1 + marginPercent / 100)),
    };
  });

  const subtotalBase = trayRows.reduce((s, r) => s + r.subtotal, 0);
  // Suma de precios por bandeja con margen aplicado individualmente.
  // Usar este valor (no subtotalBase * factor) garantiza que las filas del PDF sumen al subtotal.
  const liquidAmount = trayRows.reduce((s, r) => s + r.priceWithMargin, 0) + designFeeValue;

  const brutoAmount = applyRetention ? liquidAmount / (1 - retentionRate) : liquidAmount;
  const retentionAmount = applyRetention ? Math.round(brutoAmount - liquidAmount) : 0;
  const totalRounded = roundTo50(brutoAmount);

  return {
    trayRows,
    marginPercent,
    retentionRate,
    subtotalBase: Math.round(subtotalBase),
    liquidAmount,
    designFeeValue,
    retentionAmount,
    brutoAmount: Math.round(brutoAmount),
    totalRounded,
  };
};
