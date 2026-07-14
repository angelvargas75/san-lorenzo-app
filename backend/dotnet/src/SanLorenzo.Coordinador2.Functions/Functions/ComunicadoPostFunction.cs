using System.Data;
using System.Text;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Microsoft.Data.SqlClient;
using SanLorenzo.Coordinador2.Functions.Models;
using SanLorenzo.Coordinador2.Functions.Services;

namespace SanLorenzo.Coordinador2.Functions.Functions;

public sealed class ComunicadoPostFunction
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
                JsonSerializer.Deserialize<CrearComunicadoRequest>(
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

            await using var transaction =
                (SqlTransaction)
                await connection.BeginTransactionAsync();

            try
            {
                const string sqlComunicado = """
                    INSERT INTO dbo.Comunicado
                    (
                        Titulo,
                        Contenido,
                        FechaProgramada,
                        Estado,
                        CreadoPorUsuarioId
                    )
                    OUTPUT
                        INSERTED.ComunicadoId,
                        INSERTED.Titulo,
                        INSERTED.Contenido,
                        INSERTED.FechaProgramada,
                        INSERTED.Estado,
                        INSERTED.CreadoPorUsuarioId,
                        INSERTED.FechaCreacion
                    VALUES
                    (
                        @Titulo,
                        @Contenido,
                        @FechaProgramada,
                        @Estado,
                        @CreadoPorUsuarioId
                    );
                    """;

                await using var command =
                    new SqlCommand(
                        sqlComunicado,
                        connection,
                        transaction);

                command.Parameters.Add(
                    "@Titulo",
                    SqlDbType.NVarChar,
                    200).Value =
                    datos.Titulo!.Trim();

                command.Parameters.Add(
                    "@Contenido",
                    SqlDbType.NVarChar,
                    -1).Value =
                    datos.Contenido!.Trim();

                command.Parameters.Add(
                    "@FechaProgramada",
                    SqlDbType.DateTime2).Value =
                    (object?)datos.FechaProgramada ??
                    DBNull.Value;

                command.Parameters.Add(
                    "@Estado",
                    SqlDbType.NVarChar,
                    30).Value =
                    datos.Estado!
                        .Trim()
                        .ToUpperInvariant();

                command.Parameters.Add(
                    "@CreadoPorUsuarioId",
                    SqlDbType.Int).Value =
                    datos.CreadoPorUsuarioId;

                Comunicado comunicado;

                await using (
                    var reader =
                        await command.ExecuteReaderAsync())
                {
                    if (!await reader.ReadAsync())
                    {
                        throw new InvalidOperationException(
                            "No se pudo recuperar el comunicado creado.");
                    }

                    comunicado = new Comunicado
                    {
                        ComunicadoId =
                            reader.GetInt32(0),

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
                }

                foreach (
                    var destinatario
                    in datos.Destinatarios!)
                {
                    await InsertarDestinatarioAsync(
                        connection,
                        transaction,
                        comunicado.ComunicadoId,
                        destinatario);
                }

                comunicado.Destinatarios.AddRange(
                    datos.Destinatarios.Select(
                        destinatario =>
                            new DestinatarioComunicado
                            {
                                Rol = Normalizar(
                                    destinatario.Rol),

                                Grado = Normalizar(
                                    destinatario.Grado),

                                Seccion = Normalizar(
                                    destinatario.Seccion)
                            }));

                await transaction.CommitAsync();

                return ApiResponseFactory.Create(
                    201,
                    "Comunicado creado correctamente.",
                    comunicado);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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
                $"Error al crear el comunicado: {exception}");

            return ApiResponseFactory.Create<object?>(
                500,
                "No se pudo crear el comunicado.",
                null);
        }
    }

    private static async Task InsertarDestinatarioAsync(
        SqlConnection connection,
        SqlTransaction transaction,
        int comunicadoId,
        DestinatarioComunicado destinatario)
    {
        const string sql = """
            INSERT INTO dbo.ComunicadoDestinatario
            (
                ComunicadoId,
                Rol,
                Grado,
                Seccion
            )
            VALUES
            (
                @ComunicadoId,
                @Rol,
                @Grado,
                @Seccion
            );
            """;

        await using var command =
            new SqlCommand(
                sql,
                connection,
                transaction);

        command.Parameters.Add(
            "@ComunicadoId",
            SqlDbType.Int).Value =
            comunicadoId;

        command.Parameters.Add(
            "@Rol",
            SqlDbType.NVarChar,
            50).Value =
            ObtenerValorBaseDatos(
                destinatario.Rol);

        command.Parameters.Add(
            "@Grado",
            SqlDbType.NVarChar,
            50).Value =
            ObtenerValorBaseDatos(
                destinatario.Grado);

        command.Parameters.Add(
            "@Seccion",
            SqlDbType.NVarChar,
            20).Value =
            ObtenerValorBaseDatos(
                destinatario.Seccion);

        await command.ExecuteNonQueryAsync();
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

    private static object ObtenerValorBaseDatos(
        string? valor)
    {
        var valorNormalizado =
            Normalizar(valor);

        return valorNormalizado is null
            ? DBNull.Value
            : valorNormalizado;
    }

    private static string? Normalizar(
        string? valor)
    {
        return string.IsNullOrWhiteSpace(valor)
            ? null
            : valor.Trim();
    }
}