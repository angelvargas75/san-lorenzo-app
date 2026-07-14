using System.Data;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ComunicadosGetFunction
{
    public async Task<APIGatewayHttpApiV2ProxyResponse>
        FunctionHandler(
            APIGatewayHttpApiV2ProxyRequest request,
            ILambdaContext context)
    {
        var estado = ObtenerFiltro(request, "estado");
        var rol = ObtenerFiltro(request, "rol");
        var grado = ObtenerFiltro(request, "grado");
        var seccion = ObtenerFiltro(request, "seccion");

        if (estado is not null &&
            !EstadosComunicado.EsValido(estado))
        {
            return ApiResponseFactory.Create<object?>(
                400,
                "El filtro de estado no es válido.",
                null);
        }

        if (rol?.Length > 50 ||
            grado?.Length > 50 ||
            seccion?.Length > 20)
        {
            return ApiResponseFactory.Create<object?>(
                400,
                "Uno de los filtros supera la longitud permitida.",
                null);
        }

        try
        {
            context.Logger.LogLine(
                "Consultando historial de comunicados.");

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                SELECT
                    c.ComunicadoId,
                    c.Titulo,
                    c.Contenido,
                    c.FechaProgramada,
                    c.Estado,
                    c.CreadoPorUsuarioId,
                    c.FechaCreacion,
                    d.Rol,
                    d.Grado,
                    d.Seccion
                FROM dbo.Comunicado AS c
                LEFT JOIN dbo.ComunicadoDestinatario AS d
                    ON d.ComunicadoId = c.ComunicadoId
                WHERE
                    (
                        @Estado IS NULL
                        OR c.Estado = @Estado
                    )
                    AND
                    (
                        @Rol IS NULL
                        OR EXISTS
                        (
                            SELECT 1
                            FROM dbo.ComunicadoDestinatario AS dr
                            WHERE dr.ComunicadoId = c.ComunicadoId
                              AND dr.Rol = @Rol
                        )
                    )
                    AND
                    (
                        @Grado IS NULL
                        OR EXISTS
                        (
                            SELECT 1
                            FROM dbo.ComunicadoDestinatario AS dg
                            WHERE dg.ComunicadoId = c.ComunicadoId
                              AND dg.Grado = @Grado
                        )
                    )
                    AND
                    (
                        @Seccion IS NULL
                        OR EXISTS
                        (
                            SELECT 1
                            FROM dbo.ComunicadoDestinatario AS ds
                            WHERE ds.ComunicadoId = c.ComunicadoId
                              AND ds.Seccion = @Seccion
                        )
                    )
                ORDER BY
                    c.FechaCreacion DESC,
                    c.ComunicadoId DESC,
                    d.ComunicadoDestinatarioId ASC;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            AgregarParametroTexto(
                command,
                "@Estado",
                estado?.ToUpperInvariant(),
                30);

            AgregarParametroTexto(
                command,
                "@Rol",
                rol,
                50);

            AgregarParametroTexto(
                command,
                "@Grado",
                grado,
                50);

            AgregarParametroTexto(
                command,
                "@Seccion",
                seccion,
                20);

            await using var reader =
                await command.ExecuteReaderAsync();

            var comunicadosPorId =
                new Dictionary<int, Comunicado>();

            while (await reader.ReadAsync())
            {
                var comunicadoId =
                    reader.GetInt32(0);

                if (!comunicadosPorId.TryGetValue(
                        comunicadoId,
                        out var comunicado))
                {
                    comunicado = new Comunicado
                    {
                        ComunicadoId =
                            comunicadoId,

                        Titulo =
                            reader.GetString(1),

                        Contenido =
                            reader.GetString(2),

                        FechaProgramada =
                            reader.IsDBNull(3)
                                ? null
                                : reader.GetDateTime(3),

                        Estado =
                            reader.GetString(4),

                        CreadoPorUsuarioId =
                            reader.GetInt32(5),

                        FechaCreacion =
                            reader.GetDateTime(6)
                    };

                    comunicadosPorId.Add(
                        comunicadoId,
                        comunicado);
                }

                var rolDestinatario =
                    reader.IsDBNull(7)
                        ? null
                        : reader.GetString(7);

                var gradoDestinatario =
                    reader.IsDBNull(8)
                        ? null
                        : reader.GetString(8);

                var seccionDestinatario =
                    reader.IsDBNull(9)
                        ? null
                        : reader.GetString(9);

                if (
                    rolDestinatario is not null ||
                    gradoDestinatario is not null ||
                    seccionDestinatario is not null)
                {
                    comunicado.Destinatarios.Add(
                        new DestinatarioComunicado
                        {
                            Rol = rolDestinatario,
                            Grado = gradoDestinatario,
                            Seccion = seccionDestinatario
                        });
                }
            }

            var resultado =
                comunicadosPorId.Values.ToList();

            return ApiResponseFactory.Create(
                200,
                "Comunicados obtenidos correctamente.",
                resultado);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al consultar comunicados: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudieron obtener los comunicados.",
                null);
        }
    }

    private static string? ObtenerFiltro(
        APIGatewayHttpApiV2ProxyRequest request,
        string nombre)
    {
        if (request.QueryStringParameters is null ||
            !request.QueryStringParameters.TryGetValue(
                nombre,
                out var valor) ||
            string.IsNullOrWhiteSpace(valor))
        {
            return null;
        }

        return valor.Trim();
    }

    private static void AgregarParametroTexto(
        SqlCommand command,
        string nombre,
        string? valor,
        int longitud)
    {
        command.Parameters.Add(
            nombre,
            SqlDbType.NVarChar,
            longitud).Value =
            string.IsNullOrWhiteSpace(valor)
                ? DBNull.Value
                : valor;
    }
}