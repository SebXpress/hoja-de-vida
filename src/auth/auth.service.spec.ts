import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma: any = {
    usuario: { findUnique: jest.fn(), create: jest.fn() },
    funcionario: { findUnique: jest.fn() },
  };
  const jwt: any = { signAsync: jest.fn().mockResolvedValue('token-falso') };
  let service: AuthService;

  const dto = {
    email: 'Ana@Uni.edu.ec',
    password: 'Clave1234',
    nombres: 'Ana',
    apellidos: 'Pérez',
    cedula: '1712345678',
    tipoFuncionario: 'DOCENTE' as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma, jwt);
  });

  it('rechaza el registro si el correo ya existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id: 1 });
    await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza el registro si la cédula ya existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.funcionario.findUnique.mockResolvedValue({ id: 9 });
    await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('registra con hash de contraseña y rol FUNCIONARIO', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.funcionario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 1, email: data.email, rol: data.rol }),
    );

    const res = await service.register(dto);

    const data = prisma.usuario.create.mock.calls[0][0].data;
    expect(data.passwordHash).not.toBe(dto.password);
    expect(await bcrypt.compare(dto.password, data.passwordHash)).toBe(true);
    expect(data.rol).toBe('FUNCIONARIO');
    expect(res).toEqual({ id: 1, email: 'ana@uni.edu.ec', rol: 'FUNCIONARIO' });
    expect(res).not.toHaveProperty('passwordHash');
  });

  it('rechaza el login con contraseña incorrecta', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@a.com',
      rol: 'FUNCIONARIO',
      activo: true,
      passwordHash: await bcrypt.hash('otra-clave1', 4),
      funcionario: { id: 5 },
    });
    await expect(
      service.login({ email: 'a@a.com', password: 'mala' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza el login si el usuario no existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x@x.com', password: 'Clave1234' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('devuelve un token con login válido', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@a.com',
      rol: 'FUNCIONARIO',
      activo: true,
      passwordHash: await bcrypt.hash('Clave1234', 4),
      funcionario: { id: 5 },
    });
    const res = await service.login({ email: 'a@a.com', password: 'Clave1234' });
    expect(res).toEqual({ accessToken: 'token-falso' });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1, funcionarioId: 5, rol: 'FUNCIONARIO' }),
    );
  });
});
