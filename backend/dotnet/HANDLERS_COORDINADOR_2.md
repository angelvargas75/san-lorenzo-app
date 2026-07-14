# Inventario AWS Lambda — Coordinador 2

## Información general

- Proyecto: San Lorenzo App
- Módulo: Coordinador académico — Parte 2
- Runtime: .NET 8
- Arquitectura: x86_64
- Memoria sugerida: 512 MB
- Timeout sugerido: 30 segundos
- Base de datos: Amazon RDS para SQL Server
- Acceso a credenciales: AWS Secrets Manager
- Contrato API: backend/openapi/coordinador-2-api.yaml
- Script SQL: backend/sql/05_coordinador_2.sql

## Variables de entorno

### DB_SECRET_ARN

Obligatoria.

Contiene el ARN o nombre del secreto de AWS Secrets Manager con las credenciales de SQL Server.

Formato esperado:

```json
{
  "host": "servidor-rds",
  "port": 1433,
  "username": "usuario",
  "password": "contrasena",
  "dbname": "SanLorenzoDb"
}

También se acepta la propiedad `database` en lugar de `dbname`.

### DB_NAME

Opcional.

Permite sobrescribir el nombre de la base de datos declarado en el secreto.

### DB_TRUST_SERVER_CERTIFICATE

Opcional.

Valores:

- `false`: valor recomendado para AWS.
- `true`: solamente para ambientes controlados que requieran confiar en el certificado del servidor.

## Permisos IAM requeridos

El rol de ejecución de cada Lambda debe permitir:

- `secretsmanager:GetSecretValue` sobre el secreto configurado.
- `kms:Decrypt` cuando el secreto use una clave KMS administrada por el proyecto.
- Escritura de logs en Amazon CloudWatch.

## Conectividad requerida

Las Lambdas deben tener conectividad con Amazon RDS:

- VPC configurada.
- Subredes privadas compatibles.
- Security Group de Lambda autorizado.
- Security Group de RDS permitiendo tráfico TCP por el puerto 1433 desde el Security Group de Lambda.

## Rutas y handlers

### 1. Obtener configuración institucional

- Método: `GET`
- Ruta: `/configuracion`
- Evento: `backend/events/coordinador-2/configuracion-get.json`
- Clase: `ConfiguracionGetFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ConfiguracionGetFunction::FunctionHandler
```

### 2. Actualizar configuración institucional

- Método: `PUT`
- Ruta: `/configuracion`
- Evento: `backend/events/coordinador-2/configuracion-put.json`
- Clase: `ConfiguracionPutFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ConfiguracionPutFunction::FunctionHandler
```

### 3. Obtener perfil del coordinador

- Método: `GET`
- Ruta: `/coordinadores/{id}/perfil`
- Evento: `backend/events/coordinador-2/perfil-get.json`
- Clase: `PerfilGetFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.PerfilGetFunction::FunctionHandler
```

### 4. Actualizar perfil del coordinador

- Método: `PUT`
- Ruta: `/coordinadores/{id}/perfil`
- Evento: `backend/events/coordinador-2/perfil-put.json`
- Clase: `PerfilPutFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.PerfilPutFunction::FunctionHandler
```

### 5. Listar comunicados

- Método: `GET`
- Ruta: `/comunicados`
- Evento: `backend/events/coordinador-2/comunicados-get.json`
- Clase: `ComunicadosGetFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ComunicadosGetFunction::FunctionHandler
```

### 6. Crear comunicado

- Método: `POST`
- Ruta: `/comunicados`
- Evento: `backend/events/coordinador-2/comunicado-post.json`
- Clase: `ComunicadoPostFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ComunicadoPostFunction::FunctionHandler
```

### 7. Actualizar comunicado

- Método: `PUT`
- Ruta: `/comunicados/{id}`
- Evento: `backend/events/coordinador-2/comunicado-put.json`
- Clase: `ComunicadoPutFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ComunicadoPutFunction::FunctionHandler
```

### 8. Listar reportes

- Método: `GET`
- Ruta: `/reportes`
- Evento: `backend/events/coordinador-2/reportes-get.json`
- Clase: `ReportesGetFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ReportesGetFunction::FunctionHandler
```

### 9. Generar reporte

- Método: `POST`
- Ruta: `/reportes/generar`
- Evento: `backend/events/coordinador-2/reporte-post.json`
- Clase: `ReportePostFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ReportePostFunction::FunctionHandler
```

### 10. Obtener reporte por ID

- Método: `GET`
- Ruta: `/reportes/{id}`
- Evento: `backend/events/coordinador-2/reporte-get-by-id.json`
- Clase: `ReporteGetByIdFunction`

Handler:

```text
SanLorenzo.Coordinador2.Functions::SanLorenzo.Coordinador2.Functions.Functions.ReporteGetByIdFunction::FunctionHandler
```

## Dependencias pendientes de integración

1. Confirmar con DEV 1 la tabla definitiva de usuarios.
2. Crear las llaves foráneas de:
   - `Comunicado.CreadoPorUsuarioId`
   - `Reporte.GeneradoPorUsuarioId`
   - `PerfilCoordinador.UsuarioId`
3. Sustituir el usuario temporal con ID `1` por el usuario autenticado.
4. Sustituir los resultados simulados de reportes por consultas académicas reales.
5. Confirmar los nombres y llaves de docentes, estudiantes, grados y secciones.
6. Configurar autorizadores o validación JWT en API Gateway.
7. Actualizar `environment.apiUrl` de Angular con la URL desplegada.
8. Ejecutar pruebas integrales Angular → API Gateway → Lambda → RDS.

## Observación sobre el despliegue

Este proyecto contiene varias clases Lambda. Por ese motivo no se utiliza un único `function-handler` en `aws-lambda-tools-defaults.json`.

Durante cada despliegue debe indicarse explícitamente el handler correspondiente a la función.