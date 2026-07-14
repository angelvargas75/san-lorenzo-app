using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ConfiguracionGetFunction
{
    public async Task<APIGatewayHttpApiV2ProxyResponse>
        FunctionHandler(
            APIGatewayHttpApiV2ProxyRequest request,
            ILambdaContext context)
    {
        try
        {
            context.Logger.LogLine(
                "Consultando configuración institucional.");

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                SELECT TOP (1)
                    ConfiguracionId,
                    NombreInstitucion,
                    AnioAcademico,
                    PeriodoAcademico,
                    ToleranciaMinutos,
                    UmbralInasistencias,
                    FechaActualizacion
                FROM dbo.ConfiguracionInstitucional
                ORDER BY ConfiguracionId ASC;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return ApiResponseFactory.Create<object?>(
                    404,
                    "No se encontró la configuración institucional.",
                    null);
            }

            var configuracion =
                new ConfiguracionInstitucional
                {
                    ConfiguracionId =
                        reader.GetInt32(0),

                    NombreInstitucion =
                        reader.GetString(1),

                    AnioAcademico =
                        reader.GetInt32(2),

                    PeriodoAcademico =
                        reader.GetString(3),

                    ToleranciaMinutos =
                        reader.GetInt32(4),

                    UmbralInasistencias =
                        reader.GetInt32(5),

                    FechaActualizacion =
                        reader.GetDateTime(6)
                };

            return ApiResponseFactory.Create(
                200,
                "Configuración obtenida correctamente.",
                configuracion);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al consultar la configuración: " +
                $"{exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo obtener la configuración institucional.",
                null);
        }
    }
}