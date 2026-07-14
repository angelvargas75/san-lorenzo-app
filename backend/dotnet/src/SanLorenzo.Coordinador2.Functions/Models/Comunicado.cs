namespace SanLorenzo.Coordinador2.Functions.Models;

public static class EstadosComunicado
{
    public const string Borrador = "BORRADOR";
    public const string Programado = "PROGRAMADO";
    public const string Enviado = "ENVIADO";
    public const string Cancelado = "CANCELADO";

    public static readonly IReadOnlySet<string> Todos =
        new HashSet<string>(
            new[]
            {
                Borrador,
                Programado,
                Enviado,
                Cancelado
            },
            StringComparer.OrdinalIgnoreCase);

    public static bool EsValido(string? estado)
    {
        return !string.IsNullOrWhiteSpace(estado) &&
               Todos.Contains(estado);
    }
}

public sealed class DestinatarioComunicado
{
    public string? Rol { get; init; }

    public string? Grado { get; init; }

    public string? Seccion { get; init; }

    public bool EsValido()
    {
        return !string.IsNullOrWhiteSpace(Rol) ||
               !string.IsNullOrWhiteSpace(Grado) ||
               !string.IsNullOrWhiteSpace(Seccion);
    }
}

public sealed class Comunicado
{
    public int ComunicadoId { get; init; }

    public string Titulo { get; init; } = string.Empty;

    public string Contenido { get; init; } = string.Empty;

    public DateTime? FechaProgramada { get; init; }

    public string Estado { get; init; } = string.Empty;

    public int CreadoPorUsuarioId { get; init; }

    public DateTime FechaCreacion { get; init; }

    public List<DestinatarioComunicado> Destinatarios { get; init; } = [];
}

public sealed class CrearComunicadoRequest
{
    public string? Titulo { get; init; }

    public string? Contenido { get; init; }

    public DateTime? FechaProgramada { get; init; }

    public string? Estado { get; init; }

    public int CreadoPorUsuarioId { get; init; }

    public List<DestinatarioComunicado>? Destinatarios { get; init; }

    public IReadOnlyList<string> Validar()
    {
        return ComunicadoRequestValidator.Validar(
            Titulo,
            Contenido,
            FechaProgramada,
            Estado,
            Destinatarios,
            CreadoPorUsuarioId,
            permitirCancelado: false);
    }
}

public sealed class ActualizarComunicadoRequest
{
    public string? Titulo { get; init; }

    public string? Contenido { get; init; }

    public DateTime? FechaProgramada { get; init; }

    public string? Estado { get; init; }

    public List<DestinatarioComunicado>? Destinatarios { get; init; }

    public IReadOnlyList<string> Validar()
    {
        return ComunicadoRequestValidator.Validar(
            Titulo,
            Contenido,
            FechaProgramada,
            Estado,
            Destinatarios,
            creadoPorUsuarioId: null,
            permitirCancelado: true);
    }
}

internal static class ComunicadoRequestValidator
{
    public static IReadOnlyList<string> Validar(
        string? titulo,
        string? contenido,
        DateTime? fechaProgramada,
        string? estado,
        IReadOnlyCollection<DestinatarioComunicado>? destinatarios,
        int? creadoPorUsuarioId,
        bool permitirCancelado)
    {
        var errores = new List<string>();

        var tituloNormalizado = titulo?.Trim() ?? string.Empty;
        var contenidoNormalizado = contenido?.Trim() ?? string.Empty;
        var estadoNormalizado =
            estado?.Trim().ToUpperInvariant() ?? string.Empty;

        if (tituloNormalizado.Length is < 3 or > 200)
        {
            errores.Add(
                "El título debe contener entre 3 y 200 caracteres.");
        }

        if (contenidoNormalizado.Length < 5)
        {
            errores.Add(
                "El contenido debe contener al menos 5 caracteres.");
        }

        if (!EstadosComunicado.EsValido(estadoNormalizado))
        {
            errores.Add(
                "El estado del comunicado no es válido.");
        }

        if (!permitirCancelado &&
            estadoNormalizado == EstadosComunicado.Cancelado)
        {
            errores.Add(
                "Un comunicado nuevo no puede crearse como cancelado.");
        }

        if (estadoNormalizado == EstadosComunicado.Programado)
        {
            if (fechaProgramada is null)
            {
                errores.Add(
                    "Un comunicado programado requiere fecha programada.");
            }
            else if (
                fechaProgramada.Value.ToUniversalTime() <=
                DateTime.UtcNow)
            {
                errores.Add(
                    "La fecha programada debe ser posterior al momento actual.");
            }
        }

        if (creadoPorUsuarioId.HasValue &&
            creadoPorUsuarioId.Value <= 0)
        {
            errores.Add(
                "El identificador del usuario creador no es válido.");
        }

        if (destinatarios is null || destinatarios.Count == 0)
        {
            errores.Add(
                "Debe especificarse al menos un destinatario.");
        }
        else
        {
            foreach (var destinatario in destinatarios)
            {
                if (!destinatario.EsValido())
                {
                    errores.Add(
                        "Cada destinatario debe tener rol, grado o sección.");
                }

                if (destinatario.Rol?.Trim().Length > 50)
                {
                    errores.Add(
                        "El rol del destinatario no debe superar 50 caracteres.");
                }

                if (destinatario.Grado?.Trim().Length > 50)
                {
                    errores.Add(
                        "El grado del destinatario no debe superar 50 caracteres.");
                }

                if (destinatario.Seccion?.Trim().Length > 20)
                {
                    errores.Add(
                        "La sección del destinatario no debe superar 20 caracteres.");
                }
            }
        }

        return errores.Distinct().ToList();
    }
}