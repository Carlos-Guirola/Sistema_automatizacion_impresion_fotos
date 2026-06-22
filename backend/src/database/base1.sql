CREATE DATABASE papeleria;
USE papeleria;

CREATE TABLE empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    correo VARCHAR(150),
    estado TINYINT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registros (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono_whatsapp VARCHAR(20) NOT NULL,
    contraseña VARCHAR(300) NOT NULL,

    estado TINYINT DEFAULT 0 COMMENT '0=Pendiente,1=Aprobado,2=Rechazado',

    correo_verificado TINYINT DEFAULT 0 COMMENT '0=No verificado,1=Verificado',
    token_verificacion VARCHAR(120) NULL,
    fecha_verificacion DATETIME NULL,
    dias_acceso INT DEFAULT 15 COMMENT 'Dias permitidos de acceso desde fecha_registro',
    fecha_ultima_activacion DATETIME NULL,

    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    id_registro INT NOT NULL UNIQUE,
    id_empresa INT NULL,
    estado TINYINT DEFAULT 1 COMMENT '1=Activo,0=Inactivo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_registro) REFERENCES registros(id_registro),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
);

INSERT INTO empresas (
    nombre,
    telefono,
    direccion,
    correo
)
VALUES (
    'ToolsPrint Demo',
    '7000-0000',
    'San Salvador, El Salvador',
    'admin@toolsprint.com'
);

INSERT INTO registros (
    nombre,
    apellido,
    correo,
    telefono_whatsapp,
    contraseña,
    estado,
    correo_verificado,
    dias_acceso
)
VALUES (
    'Administrador',
    'General',
    'admin@gmail.com',
    '7000-0000',
    '$2b$10$6A1Z8u29xJHR/rvJ0KDm7ej6efrUI9DtcNAZ01ITWfM9CFyYriQ4K',
    1,
    1,
    15
);

INSERT INTO usuarios (
    id_registro,
    id_empresa,
    estado
)
VALUES (
    1,
    1,
    1
);