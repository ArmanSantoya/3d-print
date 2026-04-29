/**
 * Parses OrcaSlicer summary text to extract weight and time
 * Expected format:
 * Filamento total: 119.52 m, 350.72 g
 * Tiempo total: 1d21h24m (or 15h14m, or just h14m)
 */

export const parseOrcaSlicerData = (text) => {
  try {
    const result = {
      weight: null,
      time: null,
      errors: [],
    };

    // Extract weight from "Filamento total: X m, Y g"
    const weightMatch = text.match(/Filamento total:.*?(\d+(?:[.,]\d+)?)\s*g/i);
    if (weightMatch) {
      const weight = parseFloat(weightMatch[1].replace(',', '.'));
      result.weight = weight;
    } else {
      result.errors.push('No se encontró el peso (Filamento total)');
    }

    // Extract time from "Tiempo total: 1d21h24m" or "15h14m" or "1d21h24m"
    const timeMatch = text.match(/Tiempo total:\s*([0-9]+d)?([0-9]+)h([0-9]+)m/i);
    if (timeMatch) {
      const days = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
      const hours = parseInt(timeMatch[2]);
      const minutes = parseInt(timeMatch[3]);

      // Convert to decimal hours
      const totalHours = days * 24 + hours + minutes / 60;
      result.time = parseFloat(totalHours.toFixed(2));
    } else {
      result.errors.push('No se encontró el tiempo total (Tiempo total)');
    }

    return result;
  } catch (error) {
    return {
      weight: null,
      time: null,
      errors: [`Error al parsear: ${error.message}`],
    };
  }
};

/**
 * Validates the parsed data
 */
export const validateParsedData = (data) => {
  const errors = [];

  if (data.weight === null || data.weight === undefined) {
    errors.push('Peso no detectado');
  } else if (data.weight <= 0) {
    errors.push('Peso debe ser mayor a 0');
  } else if (data.weight > 5000) {
    errors.push('Peso parece irreal (> 5000g)');
  }

  if (data.time === null || data.time === undefined) {
    errors.push('Tiempo no detectado');
  } else if (data.time <= 0) {
    errors.push('Tiempo debe ser mayor a 0');
  } else if (data.time > 500) {
    errors.push('Tiempo parece irreal (> 500h)');
  }

  return errors;
};
