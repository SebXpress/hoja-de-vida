import { Rol } from '@prisma/client';

export interface UsuarioAutenticado {
  id: number;
  email: string;
  rol: Rol;
  funcionarioId: number;
}
