import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const ctx = (rol?: string) =>
    ({
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user: rol ? { rol } : undefined }) }),
    }) as unknown as ExecutionContext;

  it('permite el acceso si la ruta no exige roles', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(ctx('FUNCIONARIO'))).toBe(true);
  });

  it('deniega a un FUNCIONARIO en ruta de Talento Humano', () => {
    const reflector = { getAllAndOverride: () => ['TALENTO_HUMANO', 'ADMIN'] } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(ctx('FUNCIONARIO'))).toBe(false);
  });

  it('permite a TALENTO_HUMANO', () => {
    const reflector = { getAllAndOverride: () => ['TALENTO_HUMANO', 'ADMIN'] } as unknown as Reflector;
    expect(new RolesGuard(reflector).canActivate(ctx('TALENTO_HUMANO'))).toBe(true);
  });
});
