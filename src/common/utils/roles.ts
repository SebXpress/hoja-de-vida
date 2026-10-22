import { Rol } from '@prisma/client';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

export function esRevisor(user: UsuarioAutenticado): boolean {
  return user.rol === Rol.TALENTO_HUMANO || user.rol === Rol.ADMIN;
}
