using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Microsoft.Data.SqlClient;

namespace SanLorenzo.Coordinador2.Functions.Services;

public static class SqlConnectionFactory
{
    private static readonly Lazy<Task<DatabaseSecret>>
        SecretLoader = new(CargarSecretoAsync);

    public static async Task<SqlConnection>
        CreateOpenConnectionAsync()
    {
        var secret = await SecretLoader.Value;

        var database =
            Environment.GetEnvironmentVariable("DB_NAME")
            ?? secret.Database
            ?? secret.DbName;

        if (string.IsNullOrWhiteSpace(database))
        {
            throw new InvalidOperationException(
                "No se configuró el nombre de la base de datos.");
        }

        var trustServerCertificate =
            bool.TryParse(
                Environment.GetEnvironmentVariable(
                    "DB_TRUST_SERVER_CERTIFICATE"),
                out var trustCertificate)
            && trustCertificate;

        var connectionString =
            new SqlConnectionStringBuilder
            {
                DataSource =
                    $"{secret.Host},{secret.Port}",

                InitialCatalog =
                    database,

                UserID =
                    secret.Username,

                Password =
                    secret.Password,

                Encrypt =
                    true,

                TrustServerCertificate =
                    trustServerCertificate,

                ConnectTimeout =
                    10,

                PersistSecurityInfo =
                    false,

                MultipleActiveResultSets =
                    false
            };

        var connection =
            new SqlConnection(connectionString.ConnectionString);

        await connection.OpenAsync();

        return connection;
    }

    private static async Task<DatabaseSecret>
        CargarSecretoAsync()
    {
        var secretId =
            Environment.GetEnvironmentVariable("DB_SECRET_ARN");

        if (string.IsNullOrWhiteSpace(secretId))
        {
            throw new InvalidOperationException(
                "No se configuró la variable DB_SECRET_ARN.");
        }

        using var client =
            new AmazonSecretsManagerClient();

        var response =
            await client.GetSecretValueAsync(
                new GetSecretValueRequest
                {
                    SecretId = secretId
                });

        if (string.IsNullOrWhiteSpace(response.SecretString))
        {
            throw new InvalidOperationException(
                "El secreto no contiene SecretString.");
        }

        var secret =
            JsonSerializer.Deserialize<DatabaseSecret>(
                response.SecretString,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

        if (secret is null)
        {
            throw new InvalidOperationException(
                "El secreto no tiene un formato válido.");
        }

        if (string.IsNullOrWhiteSpace(secret.Host) ||
            string.IsNullOrWhiteSpace(secret.Username) ||
            string.IsNullOrWhiteSpace(secret.Password))
        {
            throw new InvalidOperationException(
                "El secreto no contiene host, username o password.");
        }

        return secret;
    }

    private sealed class DatabaseSecret
    {
        [JsonPropertyName("host")]
        public string Host { get; init; } = string.Empty;

        [JsonPropertyName("username")]
        public string Username { get; init; } = string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; init; } = string.Empty;

        [JsonPropertyName("port")]
        public int Port { get; init; } = 1433;

        [JsonPropertyName("dbname")]
        public string? DbName { get; init; }

        [JsonPropertyName("database")]
        public string? Database { get; init; }
    }
}