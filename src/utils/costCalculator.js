export const roundTo50 = (value) => Math.round((Number(value) || 0) / 50) * 50;

export const calculateTrayDetails = (tray, config) => {
  const weight = Number(tray.weight) || 0;
  const time = Number(tray.time) || 0;
  const materialKey = tray.material;

  // Material
  const materialPricePerKg = (config.materials && config.materials[materialKey]) || 0;
  const materialCost = weight * (materialPricePerKg / 1000);

  // Energía
  const consumptionKw = Number(config.printers?.[tray.printer]?.consumptionKw) || 0;
  const pricePerKwh = Number(config.electricity?.pricePerKwh) || 0;
  const electricityCost = time * consumptionKw * pricePerKwh;

  // Costo fijo de máquina por hora (específico de la impresora)
  const machineCostPerHour = Number(config.printers?.[tray.printer]?.machineCostPerHour) || Number(config.machineCostPerHour) || 0;
  const machineCost = time * machineCostPerHour;

  const subtotal = materialCost + electricityCost + machineCost;

  return {
    materialCost: Math.round(materialCost),
    electricityCost: Math.round(electricityCost),
    machineCost: Math.round(machineCost),
    subtotal: Math.round(subtotal),
  };
};
