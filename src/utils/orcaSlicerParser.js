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
      .toLowerCase();

    // Extract weight - be very specific
    // Look for "filamento total" followed by numbers with "m," and then grab the g value
    // Pattern: "filamento total: 119.52 m, 350.72 g" -> take 350.72
    let weightMatch = normalizedText.match(/filamento\s+total:.*?(\d+[.,]\d+)\s*m[,\s]+(\d+[.,]\d+)\s*[g9]/i);
    
    if (weightMatch) {
      // Take the second number (the grams part)
      let weight = parseFloat(weightMatch[2].replace(',', '.'));
      // Validate weight is reasonable
      if (weight > 0 && weight < 5000) {
        result.weight = weight;
      }
    }

    if (!result.weight) {
      // Fallback: try to find any pattern with just "g" or "9" (OCR confusion)
      // Get all numbers followed by g or 9
      const allGMatches = normalizedText.match(/(\d+[.,]\d+)\s*[g9]/g);
      if (allGMatches && allGMatches.length > 0) {
        // Take the last one (usually the total filament)
        const lastMatch = allGMatches[allGMatches.length - 1].match(/(\d+[.,]\d+)/);
        if (lastMatch) {
          let weight = parseFloat(lastMatch[1].replace(',', '.'));
          if (weight > 0 && weight < 5000) {
            result.weight = weight;
          }
        }
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
