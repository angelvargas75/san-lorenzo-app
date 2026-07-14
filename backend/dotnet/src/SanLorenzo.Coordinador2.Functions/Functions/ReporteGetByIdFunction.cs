using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ReporteGetByIdFunction
{
    public async Task<APIGatewayHttpApiV2ProxyResponse>
        FunctionHandler(
            APIGatewayHttpApiV2ProxyRequest request,
            ILambdaContext context)
    {
        if (!ObtenerReporteId(
                request,
                out var reporteId))
        {
            return ApiResponseFactory.Create<object?>(
                400,
                "El identificador del reporte no es válido.",
                null);
        }

        try
        {
            context.Logger.LogLine(
                $"Consultando reporte {reporteId}.");

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                SELECT
                    ReporteId,
                    TipoReporte,
                    GeneradoPorUsuarioId,
                    FechaGeneracion,
                    FiltrosJson,
                    ResultadoJson
                FROM dbo.Reporte
                WHERE ReporteId = @ReporteId;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.AddWithValue(
                "@ReporteId",
                reporteId);

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return ApiResponseFactory.Create<object?>(
                    404,
                    "No se encontró el reporte solicitado.",
                    null);
            }

            var filtrosJson =
                reader.IsDBNull(4)
                    ? null
                    : reader.GetString(4);

            var resultadoJson =
                reader.IsDBNull(5)
                    ? null
                    : reader.GetString(5);

            var reporte =
                new ReporteDetalle
                {
                    ReporteId =
                        reader.GetInt32(0),

                    TipoReporte =
                        reader.GetString(1),

                    GeneradoPorUsuarioId =
                        reader.GetInt32(2),

                    FechaGeneracion =
                        reader.GetDateTime(3),

                    Filtros =
                        LeerJsonSeguro(
                            filtrosJson,
                            "{}",
                            JsonValueKind.Object),

                    Resultado =
                        LeerJsonSeguro(
                            resultadoJson,
                            "[]",
                            JsonValueKind.Array)
                };

            return ApiResponseFactory.Create(
                200,
                "Reporte obtenido correctamente.",
                reporte);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al consultar el reporte: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo obtener el reporte.",
                null);
        }
    }

    private static bool ObtenerReporteId(
        APIGatewayHttpApiV2ProxyRequest request,
        out int reporteId)
    {
        reporteId = 0;

        return request.PathParameters is not null &&
               request.PathParameters.TryGetValue(
                   "id",
                   out var idTexto) &&
               int.TryParse(
                   idTexto,
                   out reporteId) &&
               reporteId > 0;
    }

    private static JsonElement LeerJsonSeguro(
        string? json,
        string valorPredeterminado,
        JsonValueKind tipoEsperado)
    {
        try
        {
            var contenido =
                string.IsNullOrWhiteSpace(json)
                    ? valorPredeterminado
                    : json;

            using var document =
                JsonDocument.Parse(contenido);

            if (
                document.RootElement.ValueKind !=
                tipoEsperado)
            {
                return LeerValorPredeterminado(
                    valorPredeterminado);
            }

            return document.RootElement.Clone();
        }
        catch (JsonException)
        {
            return LeerValorPredeterminado(
                valorPredeterminado);
        }
    }

    private static JsonElement LeerValorPredeterminado(
        string valorPredeterminado)
    {
        using var document =
            JsonDocument.Parse(
                valorPredeterminado);

        return document.RootElement.Clone();
    }
}