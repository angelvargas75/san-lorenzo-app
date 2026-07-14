using System.Text.Json;

namespace SanLorenzo.Coordinador2.Functions.Models;

public static class TiposReporte
{
    public const string Asistencia = "ASISTENCIA";
    public const string Calificaciones = "CALIFICACIONES";
    public const string Usuarios = "USUARIOS";

    public static readonly IReadOnlySet<string> Todos =
        new HashSet<string>(
            new[]
            {
                Asistencia,
                Calificaciones,
                Usuarios
            },
            StringComparer.OrdinalIgnoreCase);

    public static bool EsValido(string? tipoReporte)
    {
        return !string.IsNullOrWhiteSpace(tipoReporte) &&
               Todos.Contains(tipoReporte);
    }
}

public class ReporteResumen
{
    public int ReporteId { get; init; }

    public string TipoReporte { get; init; } = string.Empty;

    public int GeneradoPorUsuarioId { get; init; }

    public DateTime FechaGeneracion { get; init; }
}

public sealed class ReporteDetalle : ReporteResumen
{
    public JsonElement Filtros { get; init; }

    public JsonElement Resultado { get; init; }
}

public sealed class GenerarReporteRequest
{
    public string? TipoReporte { get; init; }

    public string? Grado { get; init; }

    public string? Seccion { get; init; }

    public int? DocenteId { get; init; }

    public string? Periodo { get; init; }

    public int GeneradoPorUsuarioId { get; init; }

    public IReadOnlyList<string> Validar()
    {
        var errores = new List<string>();

        var tipoReporte =
            TipoReporte?.Trim().ToUpperInvariant();

        var grado = Grado?.Trim();
        var seccion = Seccion?.Trim();
        var periodo = Periodo?.Trim() ?? string.Empty;

        if (!TiposReporte.EsValido(tipoReporte))
        {
            errores.Add(
                "El tipo de reporte no es válido.");
        }

        if (periodo.Length is < 2 or > 100)
        {
            errores.Add(
                "El periodo debe contener entre 2 y 100 caracteres.");
        }

        if (!string.IsNullOrWhiteSpace(grado) &&
            grado.Length > 100)
        {
            errores.Add(
                "El grado no debe superar los 100 caracteres.");
        }

        if (!string.IsNullOrWhiteSpace(seccion) &&
            seccion.Length > 20)
        {
            errores.Add(
                "La sección no debe superar los 20 caracteres.");
        }

        if (DocenteId.HasValue &&
            DocenteId.Value <= 0)
        {
            errores.Add(
                "El identificador del docente no es válido.");
        }

        if (GeneradoPorUsuarioId <= 0)
        {
            errores.Add(
                "El identificador del usuario generador no es válido.");
        }

        return errores;
    }
}