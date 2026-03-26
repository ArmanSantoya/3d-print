export const calculateTrayDetails = (tray, config) => {
  const weight = Number(tray.weight) || 0;
  const time = Number(tray.time) || 0; // horas decimales
  const materialKey = tray.material;

  // Material
  const materialPricePerKg = (config.materials && config.materials[materialKey]) || 0;
  const pricePerGram = materialPricePerKg / 1000;
  const materialCost = weight * pricePerGram;

  // Energía
  const consumptionKw = Number(config.printers?.[tray.printer]?.consumptionKw) || 0;
  const pricePerKwh = Number(config.electricity?.pricePerKwh) || 0;
  const electricityCostPerHour = consumptionKw * pricePerKwh;
  const electricityCost = time * electricityCostPerHour;

  // Costo fijo de máquina por hora
  const machineCost = time * (config.machineCostPerHour || 0);

  // Subtotal directo (sin margen ni IVA)
  const subtotal = materialCost + electricityCost + machineCost;

  return {
    materialCost: Math.round(materialCost),
    electricityCost: Math.round(electricityCost),
    machineCost: Math.round(machineCost),
    subtotal: Math.round(subtotal)
  };
};