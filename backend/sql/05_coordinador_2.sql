/* ============================================================
   PROYECTO: Sistema de Gestión Escolar
   INSTITUCIÓN: IEP Santiago Apóstol
   MÓDULO: Coordinador - Parte 2
   RESPONSABLE: DEV 5
   BASE DE DATOS: SQL Server
   ============================================================ */

SET NOCOUNT ON;
GO

/* ============================================================
   1. CONFIGURACIÓN INSTITUCIONAL
   ============================================================ */

IF OBJECT_ID('dbo.ConfiguracionInstitucional', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ConfiguracionInstitucional
    (
        ConfiguracionId INT IDENTITY(1,1) NOT NULL,
        NombreInstitucion NVARCHAR(150) NOT NULL,
        AnioAcademico INT NOT NULL,
        PeriodoAcademico NVARCHAR(50) NOT NULL,
        ToleranciaMinutos INT NOT NULL
            CONSTRAINT DF_Configuracion_Tolerancia DEFAULT 10,
        UmbralInasistencias INT NOT NULL
            CONSTRAINT DF_Configuracion_Umbral DEFAULT 3,
        FechaActualizacion DATETIME2 NOT NULL
            CONSTRAINT DF_Configuracion_Fecha DEFAULT SYSDATETIME(),

        CONSTRAINT PK_ConfiguracionInstitucional
            PRIMARY KEY (ConfiguracionId),

        CONSTRAINT CK_Configuracion_Anio
            CHECK (AnioAcademico BETWEEN 2020 AND 2100),

        CONSTRAINT CK_Configuracion_Tolerancia
            CHECK (ToleranciaMinutos BETWEEN 0 AND 120),

        CONSTRAINT CK_Configuracion_Umbral
            CHECK (UmbralInasistencias BETWEEN 0 AND 100)
    );
END;
GO

/* ============================================================
   2. COMUNICADOS
   ============================================================ */

IF OBJECT_ID('dbo.Comunicado', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Comunicado
    (
        ComunicadoId INT IDENTITY(1,1) NOT NULL,
        Titulo NVARCHAR(200) NOT NULL,
        Contenido NVARCHAR(MAX) NOT NULL,
        FechaProgramada DATETIME2 NULL,
        Estado NVARCHAR(30) NOT NULL
            CONSTRAINT DF_Comunicado_Estado DEFAULT 'BORRADOR',
        CreadoPorUsuarioId INT NOT NULL,
        FechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_Comunicado_FechaCreacion DEFAULT SYSDATETIME(),
        FechaActualizacion DATETIME2 NULL,

        CONSTRAINT PK_Comunicado
            PRIMARY KEY (ComunicadoId),

        CONSTRAINT CK_Comunicado_Estado
            CHECK (
                Estado IN (
                    'BORRADOR',
                    'PROGRAMADO',
                    'ENVIADO',
                    'CANCELADO'
                )
            ),

        CONSTRAINT CK_Comunicado_Titulo
            CHECK (LEN(LTRIM(RTRIM(Titulo))) >= 3),

        CONSTRAINT CK_Comunicado_Contenido
            CHECK (LEN(LTRIM(RTRIM(Contenido))) >= 5)
    );
END;
GO

/* Pendiente de coordinar con DEV 1:

   Cuando DEV 1 confirme el nombre de la tabla Usuario,
   su llave primaria y el tipo de dato utilizado, se deberá
   agregar una relación equivalente a:

   ALTER TABLE dbo.Comunicado
   ADD CONSTRAINT FK_Comunicado_Usuario
       FOREIGN KEY (CreadoPorUsuarioId)
       REFERENCES dbo.Usuario(UsuarioId);
*/
GO

/* ============================================================
   3. DESTINATARIOS DE COMUNICADOS
   ============================================================ */

IF OBJECT_ID('dbo.ComunicadoDestinatario', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ComunicadoDestinatario
    (
        ComunicadoDestinatarioId INT IDENTITY(1,1) NOT NULL,
        ComunicadoId INT NOT NULL,
        Rol NVARCHAR(50) NULL,
        Grado NVARCHAR(50) NULL,
        Seccion NVARCHAR(20) NULL,

        CONSTRAINT PK_ComunicadoDestinatario
            PRIMARY KEY (ComunicadoDestinatarioId),

        CONSTRAINT FK_ComunicadoDestinatario_Comunicado
            FOREIGN KEY (ComunicadoId)
            REFERENCES dbo.Comunicado(ComunicadoId)
            ON DELETE CASCADE,

        CONSTRAINT CK_ComunicadoDestinatario_Seleccion
            CHECK (
                Rol IS NOT NULL
                OR Grado IS NOT NULL
                OR Seccion IS NOT NULL
            )
    );
END;
GO

/* ============================================================
   4. REPORTES
   ============================================================ */

IF OBJECT_ID('dbo.Reporte', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reporte
    (
        ReporteId INT IDENTITY(1,1) NOT NULL,
        TipoReporte NVARCHAR(100) NOT NULL,
        FiltrosJson NVARCHAR(MAX) NULL,
        ResultadoJson NVARCHAR(MAX) NULL,
        GeneradoPorUsuarioId INT NOT NULL,
        FechaGeneracion DATETIME2 NOT NULL
            CONSTRAINT DF_Reporte_FechaGeneracion DEFAULT SYSDATETIME(),

        CONSTRAINT PK_Reporte
            PRIMARY KEY (ReporteId),

        CONSTRAINT CK_Reporte_Tipo
            CHECK (
                TipoReporte IN (
                    'ASISTENCIA',
                    'CALIFICACIONES',
                    'USUARIOS'
                )
            )
    );
END;
GO

/* Pendiente de coordinar con DEV 1:

   ALTER TABLE dbo.Reporte
   ADD CONSTRAINT FK_Reporte_Usuario
       FOREIGN KEY (GeneradoPorUsuarioId)
       REFERENCES dbo.Usuario(UsuarioId);
*/
GO

/* ============================================================
   5. ÍNDICES
   ============================================================ */

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Comunicado_Estado'
      AND object_id = OBJECT_ID('dbo.Comunicado')
)
BEGIN
    CREATE INDEX IX_Comunicado_Estado
        ON dbo.Comunicado (Estado);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Comunicado_FechaProgramada'
      AND object_id = OBJECT_ID('dbo.Comunicado')
)
BEGIN
    CREATE INDEX IX_Comunicado_FechaProgramada
        ON dbo.Comunicado (FechaProgramada);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Reporte_TipoReporte'
      AND object_id = OBJECT_ID('dbo.Reporte')
)
BEGIN
    CREATE INDEX IX_Reporte_TipoReporte
        ON dbo.Reporte (TipoReporte);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Reporte_FechaGeneracion'
      AND object_id = OBJECT_ID('dbo.Reporte')
)
BEGIN
    CREATE INDEX IX_Reporte_FechaGeneracion
        ON dbo.Reporte (FechaGeneracion);
END;
GO

/* ============================================================
   6. CONFIGURACIÓN INICIAL
   ============================================================ */

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.ConfiguracionInstitucional
)
BEGIN
    INSERT INTO dbo.ConfiguracionInstitucional
    (
        NombreInstitucion,
        AnioAcademico,
        PeriodoAcademico,
        ToleranciaMinutos,
        UmbralInasistencias
    )
    VALUES
    (
        N'IEP Santiago Apóstol',
        2026,
        N'Segundo bimestre',
        10,
        3
    );
END;
GO

/* ============================================================
   7. CONSULTAS DE VERIFICACIÓN
   ============================================================ */

SELECT *
FROM dbo.ConfiguracionInstitucional;
GO

SELECT *
FROM dbo.Comunicado;
GO

SELECT *
FROM dbo.ComunicadoDestinatario;
GO

SELECT *
FROM dbo.Reporte;
GO

/* ============================================================
   PERFIL DEL COORDINADOR
   La FK con dbo.Usuario se agregará durante la integración
   cuando DEV 1 confirme la estructura de la tabla Usuario.
   ============================================================ */

IF OBJECT_ID('dbo.PerfilCoordinador', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PerfilCoordinador
    (
        PerfilCoordinadorId INT IDENTITY(1,1) NOT NULL,
        UsuarioId INT NOT NULL,
        Nombres NVARCHAR(80) NOT NULL,
        Apellidos NVARCHAR(100) NOT NULL,
        Correo NVARCHAR(150) NOT NULL,
        Telefono NVARCHAR(20) NULL,
        Rol NVARCHAR(30) NOT NULL
            CONSTRAINT DF_PerfilCoordinador_Rol
            DEFAULT ('COORDINADOR'),
        AreaGestion NVARCHAR(100) NULL,
        NotificacionesCorreo BIT NOT NULL
            CONSTRAINT DF_PerfilCoordinador_NotificacionesCorreo
            DEFAULT (1),
        NotificacionesSistema BIT NOT NULL
            CONSTRAINT DF_PerfilCoordinador_NotificacionesSistema
            DEFAULT (0),
        FechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_PerfilCoordinador_FechaCreacion
            DEFAULT (SYSDATETIME()),
        FechaActualizacion DATETIME2 NOT NULL
            CONSTRAINT DF_PerfilCoordinador_FechaActualizacion
            DEFAULT (SYSDATETIME()),

        CONSTRAINT PK_PerfilCoordinador
            PRIMARY KEY (PerfilCoordinadorId),

        CONSTRAINT UQ_PerfilCoordinador_UsuarioId
            UNIQUE (UsuarioId),

        CONSTRAINT CK_PerfilCoordinador_Rol
            CHECK (Rol = 'COORDINADOR')
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM dbo.PerfilCoordinador
    WHERE UsuarioId = 1
)
BEGIN
    INSERT INTO dbo.PerfilCoordinador
    (
        UsuarioId,
        Nombres,
        Apellidos,
        Correo,
        Telefono,
        Rol,
        AreaGestion,
        NotificacionesCorreo,
        NotificacionesSistema
    )
    VALUES
    (
        1,
        N'Coordinador',
        N'Académico',
        N'coordinador@santiagoapostol.edu.pe',
        NULL,
        N'COORDINADOR',
        N'Gestión académica',
        1,
        0
    );
END;
GO