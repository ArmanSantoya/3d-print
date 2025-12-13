export const defaultConfig = {
  materials: {
    PLA: 16000,
    PETG: 20000,
    ABS: 22000,
    TPU: 26500
  },
  electricity: {
    price: 150,
    // Consumo promedio real por material (kW)
    consumptionKw: {
      PLA: 0.105,
      PETG: 0.14,
      ABS: 0.14,
      TPU: 0.14
    }
  },
  margin: 50,        // 50% de ganancia
  maintenance: 0.1,  // 10% del costo de la pieza
  designFee: 5000
};
