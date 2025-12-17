/**
 * Ejemplo de test básico
 * Para validar que Jest está configurado correctamente
 */

describe('Jest Configuration', () => {
  it('debería ejecutarse correctamente', () => {
    expect(true).toBe(true);
  });

  it('debería hacer aritmética básica', () => {
    expect(2 + 2).toBe(4);
  });
});
