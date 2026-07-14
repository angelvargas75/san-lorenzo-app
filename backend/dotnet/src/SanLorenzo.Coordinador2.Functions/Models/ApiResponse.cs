using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;

namespace SanLorenzo.Coordinador2.Functions.Models;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }

    public string Message { get; init; } = string.Empty;

    public T? Data { get; init; }
}

public static class ApiResponseFactory
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public static APIGatewayHttpApiV2ProxyResponse Create<T>(
        int statusCode,
        string message,
        T? data)
    {
        var payload = new ApiResponse<T>
        {
            Success = statusCode is >= 200 and < 400,
            Message = message,
            Data = data
        };

        var corsOrigin =
            Environment.GetEnvironmentVariable("CORS_ORIGIN")
            ?? "*";

        return new APIGatewayHttpApiV2ProxyResponse
        {
            StatusCode = statusCode,
            IsBase64Encoded = false,

            Headers = new Dictionary<string, string>
            {
                ["Content-Type"] =
                    "application/json; charset=utf-8",

                ["Access-Control-Allow-Origin"] =
                    corsOrigin,

                ["Access-Control-Allow-Headers"] =
                    "Content-Type,Authorization",

                ["Access-Control-Allow-Methods"] =
                    "OPTIONS,GET,POST,PUT"
            },

            Body = JsonSerializer.Serialize(
                payload,
                JsonOptions)
        };
    }
}
