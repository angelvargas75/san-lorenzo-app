using System.Net.Mail;

namespace SanLorenzo.Coordinador2.Functions.Models;

public sealed class PerfilCoordinador
{
    public int UsuarioId { get; init; }

    public string Nombres { get; init; } = string.Empty;

    public string Apellidos { get; init; } = string.Empty;

    public string Correo { get; init; } = string.Empty;

    public string? Telefono { get; init; }

    public string Rol { get; init; } = string.Empty;

    public string? AreaGestion { get; init; }

    public bool NotificacionesCorreo { get; init; }

    public bool NotificacionesSistema { get; init; }
}

public sealed class ActualizarPerfilRequest
{
    public string? Nombres { get; init; }

    public string? Apellidos { get; init; }

    public string? Correo { get; init; }

    public string? Telefono { get; init; }

    public string? AreaGestion { get; init; }

    public bool NotificacionesCorreo { get; init; }

    public bool NotificacionesSistema { get; init; }

    public IReadOnlyList<string> Validar()
    {
        var errores = new List<string>();

        var nombres = Nombres?.Trim() ?? string.Empty;
        var apellidos = Apellidos?.Trim() ?? string.Empty;
        var correo = Correo?.Trim() ?? string.Empty;
        var telefono = Telefono?.Trim();
        var areaGestion = AreaGestion?.Trim();

        if (nombres.Length is < 2 or > 80)
        {
            errores.Add(
                "Los nombres deben contener entre 2 y 80 caracteres.");
        }

        if (apellidos.Length is < 2 or > 100)
        {
            errores.Add(
                "Los apellidos deben contener entre 2 y 100 caracteres.");
        }

        if (!EsCorreoValido(correo))
        {
            errores.Add(
                "El correo electrónico no tiene un formato válido.");
        }

        if (!string.IsNullOrWhiteSpace(telefono) &&
            telefono.Length > 20)
        {
            errores.Add(
                "El teléfono no debe superar los 20 caracteres.");
        }

        if (!string.IsNullOrWhiteSpace(areaGestion) &&
            areaGestion.Length > 100)
        {
            errores.Add(
                "El área de gestión no debe superar los 100 caracteres.");
        }

        return errores;
    }

    private static bool EsCorreoValido(string correo)
    {
        if (string.IsNullOrWhiteSpace(correo))
        {
            return false;
        }

        try
        {
            var direccion = new MailAddress(correo);

            return direccion.Address.Equals(
                correo,
                StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}