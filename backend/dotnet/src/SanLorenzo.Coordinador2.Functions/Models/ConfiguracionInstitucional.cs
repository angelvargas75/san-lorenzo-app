namespace SanLorenzo.Coordinador2.Functions.Models;

public sealed class ConfiguracionInstitucional
{
    public int ConfiguracionId { get; init; }

    public string NombreInstitucion { get; init; } =
        string.Empty;

    public int AnioAcademico { get; init; }

    public string PeriodoAcademico { get; init; } =
        string.Empty;

    public int ToleranciaMinutos { get; init; }

    public int UmbralInasistencias { get; init; }

    public DateTime FechaActualizacion { get; init; }
}

public sealed class ActualizarConfiguracionRequest
{
    public string? NombreInstitucion { get; init; }

    public int AnioAcademico { get; init; }

    public string? PeriodoAcademico { get; init; }

    public int ToleranciaMinutos { get; init; }

    public int UmbralInasistencias { get; init; }

    public IReadOnlyList<string> Validar()
    {
        var errores = new List<string>();

        var nombre = NombreInstitucion?.Trim() ?? string.Empty;
        var periodo = PeriodoAcademico?.Trim() ?? string.Empty;

        if (nombre.Length is < 3 or > 150)
        {
            errores.Add(
                "El nombre de la institución debe contener " +
                "entre 3 y 150 caracteres.");
        }

        if (AnioAcademico is < 2020 or > 2100)
        {
            errores.Add(
                "El año académico debe estar entre 2020 y 2100.");
        }

        if (periodo.Length is < 2 or > 50)
        {
            errores.Add(
                "El periodo académico debe contener " +
                "entre 2 y 50 caracteres.");
        }

        if (ToleranciaMinutos is < 0 or > 120)
        {
            errores.Add(
                "La tolerancia debe estar entre 0 y 120 minutos.");
        }

        if (UmbralInasistencias is < 0 or > 100)
        {
            errores.Add(
                "El umbral de inasistencias debe estar " +
                "entre 0 y 100.");
        }

        return errores;
    }
}
