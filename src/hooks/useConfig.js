import { useState, useCallback } from 'react';
import { defaultConfig } from '../config';

const STORAGE_KEY = 'config';

export const migrateConfig = (config) => {
  // consumptionKw por impresora vivía en electricity — ahora vive en printers
  if (config.electricity?.consumptionKw && !config.printers) {
    config = {
      ...config,
      printers: {
        'P1S': { consumptionKw: config.electricity.consumptionKw, machineCostPerHour: 1200 },
        'Snapmaker U1': { consumptionKw: 0.6, machineCostPerHour: 800 },
        'Ender3 Standard': { consumptionKw: 0.3, machineCostPerHour: 500 },
      },
      electricity: { pricePerKwh: config.electricity.pricePerKwh },
    };
  }

  // machineCostPerHour global → por impresora
  if (config.machineCostPerHour && config.printers) {
    const printers = { ...config.printers };
    Object.keys(printers).forEach((printer) => {
      if (!printers[printer].machineCostPerHour) {
        printers[printer] = { ...printers[printer], machineCostPerHour: config.machineCostPerHour };
      }
    });
    config = { ...config, printers };
  }

  // iva → retentionRate (Boletas de Honorarios)
  if (config.iva && !config.retentionRate) {
    const { iva, ...rest } = config;
    config = { ...rest, retentionRate: 0.1525 };
  }

  return config;
};

export const useConfig = () => {
  const [config, setConfig] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrateConfig(raw ? JSON.parse(raw) : defaultConfig);
  });

  const saveConfig = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  return [config, setConfig, saveConfig];
};
