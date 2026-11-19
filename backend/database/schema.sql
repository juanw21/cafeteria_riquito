CREATE DATABASE IF NOT EXISTS cafeteria_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cafeteria_app_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('administrador') NOT NULL DEFAULT 'administrador',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NULL, orden INT NOT NULL DEFAULT 0, activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categorias_activo_orden (activo, orden)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS productos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, categoria_id BIGINT UNSIGNED NULL,
  nombre VARCHAR(160) NOT NULL, descripcion TEXT NULL, precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(500) NULL, disponible BOOLEAN NOT NULL DEFAULT TRUE, destacado BOOLEAN NOT NULL DEFAULT FALSE,
  ingredientes TEXT NULL, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_productos_precio CHECK (precio >= 0),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_productos_publico (disponible, destacado), INDEX idx_productos_categoria (categoria_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS servicios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(160) NOT NULL, descripcion TEXT NULL,
  imagen VARCHAR(500) NULL, activo BOOLEAN NOT NULL DEFAULT TRUE, orden INT NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_servicios_publico (activo, orden)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS especialidades (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, producto_id BIGINT UNSIGNED NULL, nombre VARCHAR(160) NOT NULL,
  descripcion TEXT NULL, imagen VARCHAR(500) NULL, activo BOOLEAN NOT NULL DEFAULT TRUE, orden INT NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_especialidad_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
  INDEX idx_especialidades_publico (activo, orden)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS contenido_sitio (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, seccion VARCHAR(80) NOT NULL,
  titulo VARCHAR(200) NULL, subtitulo VARCHAR(300) NULL, contenido TEXT NULL, imagen VARCHAR(500) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contenido_seccion (seccion), INDEX idx_contenido_activo (activo)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS configuracion_cafeteria (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1, nombre_comercial VARCHAR(180) NULL, direccion VARCHAR(500) NULL,
  telefono VARCHAR(40) NULL, email VARCHAR(190) NULL, horario_atencion TEXT NULL,
  ubicacion_mapa VARCHAR(1000) NULL, moneda CHAR(3) NULL, redes_sociales JSON NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_configuracion_unica CHECK (id = 1)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS galeria (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(200) NULL, descripcion TEXT NULL,
  ruta_archivo VARCHAR(500) NOT NULL, tipo VARCHAR(40) NOT NULL DEFAULT 'imagen', orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_galeria_publica (activo, orden)
) ENGINE=InnoDB;
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'Video ambiental de cafetería', 'Video de ambiente para la portada.',
       'https://videos.pexels.com/video-files/7652196/7652196-uhd_3840_2160_30fps.mp4', 'video', 0, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://videos.pexels.com/video-files/7652196/7652196-uhd_3840_2160_30fps.mp4');
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'El ambiente de la cafetería', 'Un espacio cálido para disfrutar una pausa.', 'https://images.pexels.com/photos/5851732/pexels-photo-5851732.jpeg?auto=compress&cs=tinysrgb&w=1200', 'imagen', 1, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://images.pexels.com/photos/5851732/pexels-photo-5851732.jpeg?auto=compress&cs=tinysrgb&w=1200');
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'Arte latte', 'Café preparado con detalle.', 'https://images.pexels.com/photos/39475008/pexels-photo-39475008.jpeg?auto=compress&cs=tinysrgb&w=1200', 'imagen', 2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://images.pexels.com/photos/39475008/pexels-photo-39475008.jpeg?auto=compress&cs=tinysrgb&w=1200');
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'Café en la barra', 'Una taza de café para disfrutar sin prisa.', 'https://images.pexels.com/photos/29253460/pexels-photo-29253460.jpeg?auto=compress&cs=tinysrgb&w=1200', 'imagen', 3, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://images.pexels.com/photos/29253460/pexels-photo-29253460.jpeg?auto=compress&cs=tinysrgb&w=1200');
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'Un rincón para compartir', 'Un ambiente cómodo para reunirse y conversar.', 'https://images.pexels.com/photos/1833769/pexels-photo-1833769.jpeg?auto=compress&cs=tinysrgb&w=1200', 'imagen', 4, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://images.pexels.com/photos/1833769/pexels-photo-1833769.jpeg?auto=compress&cs=tinysrgb&w=1200');
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'Café y repostería', 'Algo dulce para acompañar tu bebida favorita.', 'https://images.pexels.com/photos/30948318/pexels-photo-30948318.jpeg?auto=compress&cs=tinysrgb&w=1200', 'imagen', 5, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://images.pexels.com/photos/30948318/pexels-photo-30948318.jpeg?auto=compress&cs=tinysrgb&w=1200');
INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo)
SELECT 'Una pausa con café', 'Disfruta los pequeños momentos.', 'https://images.pexels.com/photos/29638681/pexels-photo-29638681.jpeg?auto=compress&cs=tinysrgb&w=1200', 'imagen', 6, TRUE
WHERE NOT EXISTS (SELECT 1 FROM galeria WHERE ruta_archivo='https://images.pexels.com/photos/29638681/pexels-photo-29638681.jpeg?auto=compress&cs=tinysrgb&w=1200');

CREATE TABLE IF NOT EXISTS preguntas_frecuentes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pregunta VARCHAR(500) NOT NULL, respuesta TEXT NOT NULL,
  palabras_clave VARCHAR(500) NULL, categoria VARCHAR(100) NULL, activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_faq_activo (activo)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(160) NOT NULL, email VARCHAR(190) NOT NULL,
  telefono VARCHAR(40) NULL, mensaje TEXT NOT NULL, estado ENUM('nuevo','leido','respondido') NOT NULL DEFAULT 'nuevo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_contacto_estado (estado, fecha_creacion)
) ENGINE=InnoDB;
