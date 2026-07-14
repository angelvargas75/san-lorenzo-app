using System.Data;
using System.Text;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class PerfilPutFunction
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public async Task<APIGatewayHttpApiV2ProxyResponse>
        FunctionHandler(
            APIGatewayHttpApiV2ProxyRequest request,
            ILambdaContext context)
    {
        if (!ObtenerUsuarioId(request, out var usuarioId))
        {
            return ApiResponseFactory.Create<object?>(
                400,
                "El identificador del coordinador no es válido.",
                null);
        }

        try
        {
            var body = ObtenerBody(request);

            if (string.IsNullOrWhiteSpace(body))
            {
                return ApiResponseFactory.Create<object?>(
                    400,
                    "El cuerpo de la solicitud es obligatorio.",
                    null);
            }

            var datos =
                JsonSerializer.Deserialize<ActualizarPerfilRequest>(
                    body,
                    JsonOptions);

            if (datos is null)
            {
                return ApiResponseFactory.Create<object?>(
                    400,
                    "El cuerpo enviado no tiene un formato válido.",
                    null);
            }

            var errores = datos.Validar();

            if (errores.Count > 0)
            {
                return ApiResponseFactory.Create(
                    400,
                    "Los datos enviados no son válidos.",
                    new
                    {
                        errors = errores
                    });
            }

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                UPDATE dbo.PerfilCoordinador
                SET
                    Nombres = @Nombres,
                    Apellidos = @Apellidos,
                    Correo = @Correo,
                    Telefono = @Telefono,
                    AreaGestion = @AreaGestion,
                    NotificacionesCorreo = @NotificacionesCorreo,
                    NotificacionesSistema = @NotificacionesSistema,
                    FechaActualizacion = SYSDATETIME()
                OUTPUT
                    INSERTED.UsuarioId,
                    INSERTED.Nombres,
                    INSERTED.Apellidos,
                    INSERTED.Correo,
                    INSERTED.Telefono,
                    INSERTED.Rol,
                    INSERTED.AreaGestion,
                    INSERTED.NotificacionesCorreo,
                    INSERTED.NotificacionesSistema
                WHERE UsuarioId = @UsuarioId;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.Add(
                "@UsuarioId",
                SqlDbType.Int).Value =
                usuarioId;

            command.Parameters.Add(
                "@Nombres",
                SqlDbType.NVarChar,
                80).Value =
                datos.Nombres!.Trim();

            command.Parameters.Add(
                "@Apellidos",
                SqlDbType.NVarChar,
                100).Value =
                datos.Apellidos!.Trim();

            command.Parameters.Add(
                "@Correo",
                SqlDbType.NVarChar,
                150).Value =
                datos.Correo!.Trim().ToLowerInvariant();

            command.Parameters.Add(
                "@Telefono",
                SqlDbType.NVarChar,
                20).Value =
                string.IsNullOrWhiteSpace(datos.Telefono)
                    ? DBNull.Value
                    : datos.Telefono.Trim();

            command.Parameters.Add(
                "@AreaGestion",
                SqlDbType.NVarChar,
                100).Value =
                string.IsNullOrWhiteSpace(datos.AreaGestion)
                    ? DBNull.Value
                    : datos.AreaGestion.Trim();

            command.Parameters.Add(
                "@NotificacionesCorreo",
                SqlDbType.Bit).Value =
                datos.NotificacionesCorreo;

            command.Parameters.Add(
                "@NotificacionesSistema",
                SqlDbType.Bit).Value =
                datos.NotificacionesSistema;

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return ApiResponseFactory.Create<object?>(
                    404,
                    "No se encontró el perfil del coordinador.",
                    null);
            }

            var perfil = LeerPerfil(reader);

            return ApiResponseFactory.Create(
                200,
                "Perfil actualizado correctamente.",
                perfil);
        }
        catch (JsonException exception)
        {
            context.Logger.LogLine(
                $"JSON inválido: {exception.Message}");

            return ApiResponseFactory.Create<object?>(
                400,
                "El cuerpo enviado no contiene un JSON válido.",
                null);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al actualizar el perfil: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo actualizar el perfil del coordinador.",
                null);
        }
    }

    private static bool ObtenerUsuarioId(
        APIGatewayHttpApiV2ProxyRequest request,
        out int usuarioId)
    {
        usuarioId = 0;

        return request.PathParameters is not null &&
               request.PathParameters.TryGetValue(
                   "id",
                   out var idTexto) &&
               int.TryParse(idTexto, out usuarioId) &&
               usuarioId > 0;
    }

    private static string? ObtenerBody(
        APIGatewayHttpApiV2ProxyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return null;
        }

        if (!request.IsBase64Encoded)
        {
            return request.Body;
        }

        var bytes =
            Convert.FromBase64String(request.Body);

        return Encoding.UTF8.GetString(bytes);
    }

    private static PerfilCoordinador LeerPerfil(
        SqlDataReader reader)
    {
        return new PerfilCoordinador
        {
            UsuarioId = reader.GetInt32(0),
            Nombres = reader.GetString(1),
            Apellidos = reader.GetString(2),
            Correo = reader.GetString(3),

            Telefono = reader.IsDBNull(4)
                ? null
                : reader.GetString(4),

            Rol = reader.GetString(5),

            AreaGestion = reader.IsDBNull(6)
                ? null
                : reader.GetString(6),

            NotificacionesCorreo = reader.GetBoolean(7),
            NotificacionesSistema = reader.GetBoolean(8)
        };
    }
}