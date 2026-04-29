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

    // Normalize text: remove extra spaces, handle common OCR issues
    const normalizedText = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\u00b0/g, '') // Remove degree symbols
      .replace(/\|/g, 'I') // Replace | with I (OCR confusion)
      .replace(/O/g, '0') // Try O as 0 in numbers (be careful with this)
      .toLowerCase();

    // Extract weight from "Filamento total: X m, Y g" - be more flexible
    // Try multiple patterns to catch variations
    let weightMatch = normalizedText.match(/filamento\s+total:.*?(\d+[.,]\d+|\d+)\s*g/i);
    if (!weightMatch) {
      // Try without the "total" part
      weightMatch = normalizedText.match(/filamento:.*?(\d+[.,]\d+|\d+)\s*g/i);
    }
    if (!weightMatch) {
      // Try looking for just "g" with preceding number
      const gMatches = normalizedText.match(/(\d+[.,]\d+|\d+)\s*g/g);
      if (gMatches && gMatches.length > 0) {
        // Take the last "g" value (usually the total)
        weightMatch = normalizedText.match(/(\d+[.,]\d+|\d+)\s*g$/);
        if (!weightMatch && gMatches.length >= 2) {
          // If not at end, try second occurrence
          const parts = normalizedText.split(/\d+[.,]\d+|\d+\s*g/);
          weightMatch = gMatches[gMatches.length - 1].match(/(\d+[.,]\d+|\d+)/);
        }
      }
    }

    if (weightMatch) {
      let weight = parseFloat(weightMatch[1].replace(',', '.'));
      // Validate weight is reasonable
      if (weight > 0 && weight < 5000) {
        result.weight = weight;
      }
    }

    if (!result.weight) {
      result.errors.push('No se encontró el peso (Filamento total)');
    }

    // Extract time from "Tiempo total: 1d21h24m" or "15h14m"
    // More flexible regex to handle variations
    let timeMatch = normalizedText.match(/tiempo\s+total:?\s*(\d+)\s*d\s*(\d+)\s*h\s*(\d+)\s*m/i);
    
    if (!timeMatch) {
      // Try without days
      timeMatch = normalizedText.match(/tiempo\s+total:?\s*(\d+)\s*h\s*(\d+)\s*m/i);
      if (timeMatch) {
        // Prepend 0 for days
        timeMatch = [timeMatch[0], '0', timeMatch[1], timeMatch[2]];
      }
    }

    if (!timeMatch) {
      // Try looking for any "dhm" or "hm" pattern
      timeMatch = normalizedText.match(/(\d+)d(\d+)h(\d+)m/i);
    }

    if (!timeMatch) {
      timeMatch = normalizedText.match(/(\d+)h(\d+)m/i);
      if (timeMatch) {
        timeMatch = [timeMatch[0], '0', timeMatch[1], timeMatch[2]];
      }
    }

    if (timeMatch) {
      try {
        const days = parseInt(timeMatch[1]) || 0;
        const hours = parseInt(timeMatch[2]) || 0;
        const minutes = parseInt(timeMatch[3]) || 0;

        // Convert to decimal hours
        const totalHours = days * 24 + hours + minutes / 60;
        if (totalHours > 0 && totalHours < 500) {
          result.time = parseFloat(totalHours.toFixed(2));
        }
      } catch (e) {
        // Time parsing failed
      }
    }

    if (!result.time) {
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
