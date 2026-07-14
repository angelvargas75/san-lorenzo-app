using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class PerfilGetFunction
{
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
            context.Logger.LogLine(
                $"Consultando perfil del usuario {usuarioId}.");

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                SELECT
                    UsuarioId,
                    Nombres,
                    Apellidos,
                    Correo,
                    Telefono,
                    Rol,
                    AreaGestion,
                    NotificacionesCorreo,
                    NotificacionesSistema
                FROM dbo.PerfilCoordinador
                WHERE UsuarioId = @UsuarioId;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "@UsuarioId",
                usuarioId);

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
                "Perfil obtenido correctamente.",
                perfil);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al consultar el perfil: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo obtener el perfil del coordinador.",
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