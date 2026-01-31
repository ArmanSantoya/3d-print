export const defaultConfig = {
  materials: {
    PLA: 16000,
    PETG: 20000,
    ABS: 22000,
    TPU: 26500
  },

  electricity: {
    consumptionKw: 0.35,   // Consumo real de la P1S ≈ 350W
    pricePerKwh: 150       // CLP/kWh
  },

  machineCostPerHour: 1000, // CLP/h fijo por uso de máquina

  margin: 30,              // % de ganancia sobre subtotal
  iva: 0.19,               // 19% IVA
  designFee: 5000          // CLP fijo por diseño
};
export default defaultConfig;