import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    if (await this.prisma.usuario.findUnique({ where: { email } })) {
      throw new ConflictException('El correo ya está registrado');
    }
    if (await this.prisma.funcionario.findUnique({ where: { cedula: dto.cedula } })) {
      throw new ConflictException('La cédula ya está registrada');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // El rol se fuerza a FUNCIONARIO: nunca se acepta desde la solicitud.
    const usuario = await this.prisma.usuario.create({
      data: {
        email,
        passwordHash,
        rol: Rol.FUNCIONARIO,
        funcionario: {
          create: {
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            cedula: dto.cedula,
            tipoFuncionario: dto.tipoFuncionario,
          },
        },
      },
    });

    return { id: usuario.id, email: usuario.email, rol: usuario.rol };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { funcionario: true },
    });

    const valido =
      !!usuario &&
      usuario.activo &&
      !!usuario.funcionario &&
      (await bcrypt.compare(dto.password, usuario.passwordHash));

    if (!valido || !usuario || !usuario.funcionario) {
      // Mensaje genérico para no revelar si el correo existe.
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      funcionarioId: usuario.funcionario.id,
    });

    return { accessToken };
  }
}
