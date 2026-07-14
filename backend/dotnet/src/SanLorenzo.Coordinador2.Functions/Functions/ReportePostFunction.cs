using System.Data;
using System.Text;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ReportePostFunction
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
                JsonSerializer.Deserialize<GenerarReporteRequest>(
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

            var tipoReporte =
                datos.TipoReporte!
                    .Trim()
                    .ToUpperInvariant();

            var grado =
                Normalizar(datos.Grado);

            var seccion =
                Normalizar(datos.Seccion);

            var periodo =
                datos.Periodo!.Trim();

            var filtros =
                new Dictionary<string, object?>
                {
                    ["tipoReporte"] = tipoReporte,
                    ["grado"] = grado,
                    ["seccion"] = seccion,
                    ["docenteId"] = datos.DocenteId,
                    ["periodo"] = periodo,
                    ["generadoPorUsuarioId"] =
                        datos.GeneradoPorUsuarioId
                };

            /*
             * Resultado temporal.
             * Durante la integración con DEV 1 debe reemplazarse
             * por consultas a las tablas académicas correspondientes.
             */
            var resultado =
                GenerarResultadoTemporal(
                    tipoReporte,
                    grado,
                    seccion);

            var filtrosJson =
                JsonSerializer.Serialize(
                    filtros,
                    JsonOptions);

            var resultadoJson =
                JsonSerializer.Serialize(
                    resultado,
                    JsonOptions);

            await using var connection =
                await SqlConnectionFactory
                    .CreateOpenConnectionAsync();

            const string sql = """
                INSERT INTO dbo.Reporte
                (
                    TipoReporte,
                    FiltrosJson,
                    ResultadoJson,
                    GeneradoPorUsuarioId
                )
                OUTPUT
                    INSERTED.ReporteId,
                    INSERTED.TipoReporte,
                    INSERTED.GeneradoPorUsuarioId,
                    INSERTED.FechaGeneracion
                VALUES
                (
                    @TipoReporte,
                    @FiltrosJson,
                    @ResultadoJson,
                    @GeneradoPorUsuarioId
                );
                """;

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters.Add(
                "@TipoReporte",
                SqlDbType.NVarChar,
                100).Value =
                tipoReporte;

            command.Parameters.Add(
                "@FiltrosJson",
                SqlDbType.NVarChar,
                -1).Value =
                filtrosJson;

            command.Parameters.Add(
                "@ResultadoJson",
                SqlDbType.NVarChar,
                -1).Value =
                resultadoJson;

            command.Parameters.Add(
                "@GeneradoPorUsuarioId",
                SqlDbType.Int).Value =
                datos.GeneradoPorUsuarioId;

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                throw new InvalidOperationException(
                    "No se pudo recuperar el reporte generado.");
            }

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
                        JsonSerializer.SerializeToElement(
                            filtros,
                            JsonOptions),

                    Resultado =
                        JsonSerializer.SerializeToElement(
                            resultado,
                            JsonOptions)
                };

            return ApiResponseFactory.Create(
                201,
                "Reporte generado correctamente.",
                reporte);
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
        catch (FormatException exception)
        {
            context.Logger.LogLine(
                $"Contenido Base64 inválido: {exception.Message}");

            return ApiResponseFactory.Create<object?>(
                400,
                "El cuerpo de la solicitud no tiene un formato válido.",
                null);
        }
        catch (Exception exception)
        {
            context.Logger.LogLine(
                $"Error al generar el reporte: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo generar el reporte.",
                null);
        }
    }

    private static List<Dictionary<string, object?>>
        GenerarResultadoTemporal(
            string tipoReporte,
            string? grado,
            string? seccion)
    {
        return tipoReporte switch
        {
            TiposReporte.Asistencia =>
                GenerarResultadoAsistencia(
                    grado,
                    seccion),

            TiposReporte.Calificaciones =>
                GenerarResultadoCalificaciones(
                    grado,
                    seccion),

            TiposReporte.Usuarios =>
                GenerarResultadoUsuarios(),

            _ =>
                new List<Dictionary<string, object?>>()
        };
    }

    private static List<Dictionary<string, object?>>
        GenerarResultadoAsistencia(
            string? grado,
            string? seccion)
    {
        return new List<Dictionary<string, object?>>
        {
            new()
            {
                ["estudiante"] = "María López",
                ["grado"] = grado ?? "Todos",
                ["seccion"] = seccion ?? "Todas",
                ["asistencias"] = 38,
                ["tardanzas"] = 2,
                ["faltas"] = 1,
                ["porcentajeAsistencia"] = "92.7%"
            },
            new()
            {
                ["estudiante"] = "José Ramírez",
                ["grado"] = grado ?? "Todos",
                ["seccion"] = seccion ?? "Todas",
                ["asistencias"] = 40,
                ["tardanzas"] = 1,
                ["faltas"] = 0,
                ["porcentajeAsistencia"] = "97.6%"
            },
            new()
            {
                ["estudiante"] = "Lucía Fernández",
                ["grado"] = grado ?? "Todos",
                ["seccion"] = seccion ?? "Todas",
                ["asistencias"] = 36,
                ["tardanzas"] = 2,
                ["faltas"] = 3,
                ["porcentajeAsistencia"] = "87.8%"
            }
        };
    }

    private static List<Dictionary<string, object?>>
        GenerarResultadoCalificaciones(
            string? grado,
            string? seccion)
    {
        return new List<Dictionary<string, object?>>
        {
            new()
            {
                ["estudiante"] = "María López",
                ["grado"] = grado ?? "Todos",
                ["seccion"] = seccion ?? "Todas",
                ["curso"] = "Matemática",
                ["promedio"] = 17,
                ["estado"] = "Aprobado"
            },
            new()
            {
                ["estudiante"] = "José Ramírez",
                ["grado"] = grado ?? "Todos",
                ["seccion"] = seccion ?? "Todas",
                ["curso"] = "Comunicación",
                ["promedio"] = 15,
                ["estado"] = "Aprobado"
            },
            new()
            {
                ["estudiante"] = "Lucía Fernández",
                ["grado"] = grado ?? "Todos",
                ["seccion"] = seccion ?? "Todas",
                ["curso"] = "Ciencia y Tecnología",
                ["promedio"] = 13,
                ["estado"] = "Aprobado"
            }
        };
    }

    private static List<Dictionary<string, object?>>
        GenerarResultadoUsuarios()
    {
        return new List<Dictionary<string, object?>>
        {
            new()
            {
                ["nombreCompleto"] = "Ana Torres",
                ["rol"] = "Docente",
                ["estado"] = "Activo",
                ["ultimoAcceso"] = "13/07/2026 08:15"
            },
            new()
            {
                ["nombreCompleto"] = "Carlos Ruiz",
                ["rol"] = "Docente",
                ["estado"] = "Activo",
                ["ultimoAcceso"] = "13/07/2026 09:30"
            },
            new()
            {
                ["nombreCompleto"] = "María López",
                ["rol"] = "Estudiante",
                ["estado"] = "Activo",
                ["ultimoAcceso"] = "12/07/2026 18:20"
            },
            new()
            {
                ["nombreCompleto"] = "José Ramírez",
                ["rol"] = "Estudiante",
                ["estado"] = "Inactivo",
                ["ultimoAcceso"] = "05/07/2026 16:05"
            }
        };
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

    private static string? Normalizar(
        string? valor)
    {
        return string.IsNullOrWhiteSpace(valor)
            ? null
            : valor.Trim();
    }
}