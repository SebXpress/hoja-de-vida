import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: {
    sub: number;
    email: string;
    rol: UsuarioAutenticado['rol'];
    funcionarioId: number;
  }): UsuarioAutenticado {
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      funcionarioId: payload.funcionarioId,
    };
  }
}
