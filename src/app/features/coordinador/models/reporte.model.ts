export type TipoReporte =
  | 'ASISTENCIA'
  | 'CALIFICACIONES'
  | 'USUARIOS';

export interface FiltroReporte {
  tipoReporte: TipoReporte;
  grado?: string | null;
  seccion?: string | null;
  docenteId?: number | null;
  periodo: string;
  generadoPorUsuarioId: number;
}

export interface ReporteResumen {
  reporteId: number;
  tipoReporte: TipoReporte;
  generadoPorUsuarioId: number;
  fechaGeneracion: string;
}

export interface ReporteDetalle extends ReporteResumen {
  filtros: Record<string, unknown>;
  resultado: Record<string, unknown>[];
}