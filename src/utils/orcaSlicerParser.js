/**
 * Parses OrcaSlicer summary text to extract weight and time
 * Handles OCR errors like missing decimals
 */

export const parseOrcaSlicerData = (text) => {
  try {
    const result = {
      weight: null,
      time: null,
      errors: [],
    };

    // Normalize text
    const normalizedText = text
      .replace(/\s+/g, ' ')
      .replace(/\u00b0/g, '')
      .replace(/\|/g, 'I')
      .toLowerCase();

    // Extract weight - look for "Filamento total:" line and extract the second number
    // Pattern: "Filamento total: 119.52 m, 350.72 g" or "Filamento total: 11952m 350729" (OCR errors)
    const filamentoLine = normalizedText.match(/filamento\s+total:\s*(.+?)(?:\n|modelo|coste|$)/i);
    
    if (filamentoLine) {
      const lineContent = filamentoLine[1];
      // Extract all numbers from the line
      const numbers = lineContent.match(/\d+/g) || [];
      
      if (numbers.length >= 2) {
        // The second number should be the grams
        // Handle OCR errors: if number is very large (>1000 for grams), it might be missing decimals
        let weightNumber = parseInt(numbers[1]);
        
        // Smart decimal correction
        // If weight > 5000, likely missing decimals. Probably format is XXX.YY
        if (weightNumber > 5000) {
          // Most likely case: OCR removed the decimal point
          // "350729" should be "350.72" or "3507.29"?
          // Use heuristic: typical filament weights are 200-400g, so:
          // If > 5000, divide by 1000 and round
          if (weightNumber > 5000 && weightNumber < 10000) {
            // Likely "350729" → insert decimal: 3507.29 is too high, so try 350.72
            // Most prints are <500g, so if result is >1000, it's wrong
            // Let's try: if 5000-10000, likely should be XX0.YY or XXX.YZ format
            // "350729" → take first 5 digits and insert before last 2: "3507.29"? No...
            // Better: most filament is 200-500g. 350729 → could be missing decimal
            // Try taking all but last 2 digits for decimal
            let str = weightNumber.toString();
            if (str.length > 5) {
              // "350729" (6 digits) → "3507.29" (too high)
              // Let's try different approach: remove trailing digits until reasonable
              while (str.length > 3 && parseFloat(str) / 100 > 500) {
                str = str.slice(0, -1);
              }
              weightNumber = parseFloat(str.slice(0, -2) + '.' + str.slice(-2));
            } else if (str.length === 5) {
              // "35072" → "350.72"
              weightNumber = parseFloat(str.slice(0, 3) + '.' + str.slice(3));
            }
          }
        }
        
        // Final validation
        if (weightNumber > 0 && weightNumber < 5000) {
          result.weight = weightNumber;
        }
      }
    }

    if (!result.weight) {
      result.errors.push('No se encontró el peso (Filamento total)');
    }

    // Extract time - same pattern as before
    let timeMatch = normalizedText.match(/tiempo\s+total:?\s*(\d+)\s*d\s*(\d+)\s*h\s*(\d+)\s*m/i);
    
    if (!timeMatch) {
      timeMatch = normalizedText.match(/tiempo\s+total:?\s*(\d+)\s*h\s*(\d+)\s*m/i);
      if (timeMatch) {
        timeMatch = [timeMatch[0], '0', timeMatch[1], timeMatch[2]];
      }
    }

    if (!timeMatch) {
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
