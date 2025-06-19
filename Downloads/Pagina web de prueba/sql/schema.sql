-- Crear la base de datos
CREATE DATABASE PortafolioWeb;
GO

USE PortafolioWeb;
GO

-- Crear tablas
CREATE TABLE Proyectos (
    Id INT PRIMARY KEY IDENTITY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(MAX) NOT NULL,
    FechaPublicacion DATE NOT NULL,
    ImagenPrincipal NVARCHAR(255),
    VideoDemo NVARCHAR(255),
    EnlaceDescarga NVARCHAR(255) NOT NULL
);

CREATE TABLE Comentarios (
    Id INT PRIMARY KEY IDENTITY,
    ProyectoId INT FOREIGN KEY REFERENCES Proyectos(Id),
    Usuario NVARCHAR(100) NOT NULL,
    Comentario NVARCHAR(MAX) NOT NULL,
    Fecha DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Categorias (
    Id INT PRIMARY KEY IDENTITY,
    Nombre NVARCHAR(50) NOT NULL
);

CREATE TABLE ProyectoCategoria (
    ProyectoId INT FOREIGN KEY REFERENCES Proyectos(Id),
    CategoriaId INT FOREIGN KEY REFERENCES Categorias(Id),
    PRIMARY KEY (ProyectoId, CategoriaId)
);

-- Insertar datos de ejemplo
-- Categorías
INSERT INTO Categorias (Nombre) VALUES
    ('Red Social'),
    ('Arte'),
    ('Móvil'),
    ('Web'),
    ('Multimedia');

-- Proyectos
INSERT INTO Proyectos (Nombre, Descripcion, FechaPublicacion, ImagenPrincipal, VideoDemo, EnlaceDescarga) VALUES
(
    'Magic 4rt+',
    'Una red social innovadora diseñada específicamente para artistas, combinando las mejores características de Pinterest e Instagram. Magic 4rt+ ofrece una plataforma única donde los artistas pueden compartir sus obras, conectar con otros creativos y construir su portafolio digital. La aplicación incluye herramientas especializadas para la presentación de arte visual, sistemas de categorización por estilos y técnicas, y una interfaz intuitiva que destaca la belleza de cada obra.',
    '2024-01-15',
    '/assets/img/magic4rt-preview.jpg',
    'https://www.youtube.com/watch?v=example1',
    '/descargas/magic4rt-plus.apk'
),
(
    'Buzzup',
    'Buzzup es una nueva red social que reimagina la forma en que las personas se conectan en línea. Inspirada en las mejores características de Facebook e Instagram, Buzzup ofrece una experiencia fresca y moderna para compartir momentos, conectar con amigos y descubrir contenido relevante. La plataforma incluye características innovadoras como timeline personalizado, sistema de reacciones mejorado y herramientas avanzadas para la creación de contenido multimedia.',
    '2024-01-20',
    '/assets/img/buzzup-preview.jpg',
    'https://www.youtube.com/watch?v=example2',
    '/descargas/buzzup.apk'
);

-- Relaciones Proyecto-Categoría
INSERT INTO ProyectoCategoria (ProyectoId, CategoriaId)
SELECT p.Id, c.Id
FROM Proyectos p
CROSS JOIN Categorias c
WHERE 
    (p.Nombre = 'Magic 4rt+' AND c.Nombre IN ('Red Social', 'Arte', 'Móvil', 'Web')) OR
    (p.Nombre = 'Buzzup' AND c.Nombre IN ('Red Social', 'Móvil', 'Web', 'Multimedia'));

-- Comentarios de ejemplo
INSERT INTO Comentarios (ProyectoId, Usuario, Comentario, Fecha) VALUES
(
    (SELECT Id FROM Proyectos WHERE Nombre = 'Magic 4rt+'),
    'Ana García',
    '¡Increíble plataforma para artistas! La interfaz es muy intuitiva y las herramientas de presentación son excelentes.',
    DATEADD(day, -5, GETDATE())
),
(
    (SELECT Id FROM Proyectos WHERE Nombre = 'Magic 4rt+'),
    'Carlos Rodríguez',
    'Me encanta cómo puedo organizar mi portafolio. La comunidad de artistas es muy activa y colaborativa.',
    DATEADD(day, -3, GETDATE())
),
(
    (SELECT Id FROM Proyectos WHERE Nombre = 'Buzzup'),
    'Laura Martínez',
    'Una red social moderna y refrescante. Las nuevas características de interacción son muy innovadoras.',
    DATEADD(day, -4, GETDATE())
),
(
    (SELECT Id FROM Proyectos WHERE Nombre = 'Buzzup'),
    'David Sánchez',
    'La experiencia de usuario es excelente. Me gusta especialmente el sistema de reacciones personalizado.',
    DATEADD(day, -2, GETDATE())
);