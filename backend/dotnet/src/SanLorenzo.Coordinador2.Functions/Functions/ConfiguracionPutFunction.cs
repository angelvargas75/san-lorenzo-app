using System.Data;
using System.Text;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ConfiguracionPutFunction
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public async Task<APIGatewayHttpApiV2ProxyResponse>
        FunctionHandler(
            APIGatewayHttpApiV2ProxyRequest request,
            ILambdaContext context)
    {
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
                JsonSerializer.Deserialize<
                    ActualizarConfiguracionRequest>(
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
                ;WITH ConfiguracionObjetivo AS
                (
                    SELECT TOP (1) *
                    FROM dbo.ConfiguracionInstitucional
                    ORDER BY ConfiguracionId ASC
                )
                UPDATE ConfiguracionObjetivo
                SET
                    NombreInstitucion = @NombreInstitucion,
                    AnioAcademico = @AnioAcademico,
                    PeriodoAcademico = @PeriodoAcademico,
                    ToleranciaMinutos = @ToleranciaMinutos,
                    UmbralInasistencias = @UmbralInasistencias,
                    FechaActualizacion = SYSDATETIME()
                OUTPUT
                    INSERTED.ConfiguracionId,
                    INSERTED.NombreInstitucion,
                    INSERTED.AnioAcademico,
                    INSERTED.PeriodoAcademico,
                    INSERTED.ToleranciaMinutos,
                    INSERTED.UmbralInasistencias,
                    INSERTED.FechaActualizacion;
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.Add(
                "@NombreInstitucion",
                SqlDbType.NVarChar,
                150).Value =
                datos.NombreInstitucion!.Trim();

            command.Parameters.Add(
                "@AnioAcademico",
                SqlDbType.Int).Value =
                datos.AnioAcademico;

            command.Parameters.Add(
                "@PeriodoAcademico",
                SqlDbType.NVarChar,
                50).Value =
                datos.PeriodoAcademico!.Trim();

            command.Parameters.Add(
                "@ToleranciaMinutos",
                SqlDbType.Int).Value =
                datos.ToleranciaMinutos;

            command.Parameters.Add(
                "@UmbralInasistencias",
                SqlDbType.Int).Value =
                datos.UmbralInasistencias;

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
                "Configuración actualizada correctamente.",
                configuracion);
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
                $"Error al actualizar la configuración: " +
                $"{exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo actualizar la configuración.",
                null);
        }
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
}