export const defaultConfig = {
  materials: {
    PLA: 16000,
    PETG: 20000,
    ABS: 22000,
    TPU: 26500
  },

  printers: {
    'P1S': { consumptionKw: 0.35, machineCostPerHour: 1200 },
    'Snapmaker U1': { consumptionKw: 0.6, machineCostPerHour: 1200 },
    'Ender3 Standard': { consumptionKw: 0.3, machineCostPerHour: 800 }
  },

  electricity: {
    pricePerKwh: 150       // CLP/kWh
  },

  margin: 30,              // % de ganancia sobre subtotal
  iva: 0.19,               // 19% IVA
  designFee: 5000          // CLP fijo por diseño
};
export default defaultConfig;