using System.Data;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ReportesGetFunction
{
    public async Task<APIGatewayHttpApiV2ProxyResponse>
        FunctionHandler(
            APIGatewayHttpApiV2ProxyRequest request,
            ILambdaContext context)
    {
        var tipoReporte =
            ObtenerFiltro(request, "tipoReporte");

        var periodo =
            ObtenerFiltro(request, "periodo");

        if (tipoReporte is not null &&
            !TiposReporte.EsValido(tipoReporte))
        {
            return ApiResponseFactory.Create<object?>(
                400,
                "El filtro de tipo de reporte no es válido.",
                null);
        }

        if (periodo?.Length > 100)
        {
            return ApiResponseFactory.Create<object?>(
                400,
                "El filtro de periodo supera la longitud permitida.",
                null);
        }

        try
        {
            context.Logger.LogLine(
                "Consultando historial de reportes.");

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                SELECT
                    r.ReporteId,
                    r.TipoReporte,
                    r.GeneradoPorUsuarioId,
                    r.FechaGeneracion
                FROM dbo.Reporte AS r
                WHERE
                    (
                        @TipoReporte IS NULL
                        OR r.TipoReporte = @TipoReporte
                    )
                    AND
                    (
                        @Periodo IS NULL
                        OR JSON_VALUE(
                            CASE
                                WHEN ISJSON(r.FiltrosJson) = 1
                                    THEN r.FiltrosJson
                                ELSE N'{}'
                            END,
                            '$.periodo'
                        ) = @Periodo
                    )
                ORDER BY
                    r.FechaGeneracion DESC,
                    r.ReporteId DESC;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            AgregarParametroTexto(
                command,
                "@TipoReporte",
                tipoReporte?.ToUpperInvariant(),
                100);

            AgregarParametroTexto(
                command,
                "@Periodo",
                periodo,
                100);

            await using var reader =
                await command.ExecuteReaderAsync();

            var reportes =
                new List<ReporteResumen>();

            while (await reader.ReadAsync())
            {
                reportes.Add(
                    new ReporteResumen
                    {
                        ReporteId =
                            reader.GetInt32(0),

                        TipoReporte =
                            reader.GetString(1),

                        GeneradoPorUsuarioId =
                            reader.GetInt32(2),

                        FechaGeneracion =
                            reader.GetDateTime(3)
                    });
            }

            return ApiResponseFactory.Create(
                200,
                "Reportes obtenidos correctamente.",
                reportes);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al consultar reportes: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudieron obtener los reportes.",
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