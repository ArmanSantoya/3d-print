import { useState, useCallback } from 'react';

/**
 * Encapsula el patrón loading/error/try-catch para operaciones async.
 *
 * @param {{ initialLoading?: boolean }} options
 *   - initialLoading: true para operaciones que cargan datos en el mount
 *     (el spinner aparece desde el inicio, antes de la primera llamada).
 *
 * @returns {{ loading: boolean, error: string, execute: (fn) => Promise }}
 *   - execute(fn): ejecuta fn(), maneja loading y error automáticamente.
 *     Retorna el valor de fn() si tiene éxito, undefined si falla.
 */
export const useAsync = ({ initialLoading = false } = {}) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState('');

  const execute = useCallback(async (fn) => {
    setLoading(true);
    setError('');
    try {
      return await fn();
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};
