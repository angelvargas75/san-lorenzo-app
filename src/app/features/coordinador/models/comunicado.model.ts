export type EstadoComunicado =
  | 'BORRADOR'
  | 'PROGRAMADO'
  | 'ENVIADO'
  | 'CANCELADO';

export interface DestinatarioComunicado {
  rol?: string | null;
  grado?: string | null;
  seccion?: string | null;
}

export interface Comunicado {
  comunicadoId?: number;
  titulo: string;
  contenido: string;
  fechaProgramada?: string | null;
  estado: EstadoComunicado;
  creadoPorUsuarioId: number;
  fechaCreacion?: string;
  destinatarios: DestinatarioComunicado[];
}

export type ActualizarComunicado = Omit<
  Comunicado,
  'comunicadoId' | 'creadoPorUsuarioId' | 'fechaCreacion'
>;