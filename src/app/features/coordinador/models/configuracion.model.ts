export interface ConfiguracionInstitucional {
  configuracionId?: number;
  nombreInstitucion: string;
  anioAcademico: number;
  periodoAcademico: string;
  toleranciaMinutos: number;
  umbralInasistencias: number;
  fechaActualizacion?: string;
}