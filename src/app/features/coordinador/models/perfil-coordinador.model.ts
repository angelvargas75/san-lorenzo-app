export interface PerfilCoordinador {
  usuarioId: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string | null;
  rol: string;
  areaGestion?: string | null;
  notificacionesCorreo: boolean;
  notificacionesSistema: boolean;
}

export type ActualizarPerfilCoordinador = Omit<
  PerfilCoordinador,
  'usuarioId' | 'rol'
>;