export function calculateCosts(tray, config) {
  const { time: timeHours, weight: weightGrams, material, machine } = tray;
  // Costos de material
  const materialCost = (weightGrams / 1000) * (config.materials?.[material] || 0);

  // Costos de electricidad
  const electricityCost = timeHours * (config.electricity?.pricePerKwh || 0);

  // Costos de máquina (protección si machine no existe)
  const machineData = config.machines?.[machine];
  const machineCost = machineData
    ? timeHours * (machineData.costPerHour || 0)
    : 0;

  // Subtotal
  const subtotal = materialCost + electricityCost + machineCost;

  // Margen
  const marginAmount = subtotal * ((config.margin || 0) / 100);

  // Total antes de impuestos
  const totalBeforeTax = subtotal + marginAmount + (config.designFee || 0);

  // IVA
  const ivaAmount = totalBeforeTax * ((config.iva || 0) / 100);

  // Total final
  const total = totalBeforeTax + ivaAmount;

  return {
    materialCost,
    electricityCost,
    machineCost,
    subtotal,
    marginAmount,
    totalBeforeTax,
    ivaAmount,
    total,
  };
}