# Portafolio Web de Aplicaciones

Este proyecto es un sitio web profesional que sirve como portafolio y centro de descarga para aplicaciones móviles y web. El sitio está construido con HTML, CSS y JavaScript puro en el frontend, y utiliza Node.js con Express.js en el backend, conectándose a una base de datos Microsoft SQL Server.

## Características Principales

- 🎨 Diseño moderno y responsivo
- 📱 Showcase de aplicaciones móviles y web
- 💾 Sistema de descargas integrado
- 💬 Sistema de comentarios
- 🏷️ Categorización de proyectos
- 🎥 Soporte para videos de demostración

## Requisitos Previos

- Node.js (versión 14 o superior)
- Microsoft SQL Server
- npm (gestor de paquetes de Node.js)

## Estructura del Proyecto

```
/project-root
│
├── /frontend
│   ├── index.html
│   ├── proyecto.html
│   ├── /css
│   │   ├── styles.css
│   │   └── proyecto.css
│   ├── /js
│   │   ├── main.js
│   │   └── proyecto.js
│
├── /backend
│   └── server.js
│
├── /sql
│   └── schema.sql
│
└── /assets
    ├── /img
    ├── /videos
    └── /descargas
```

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_DIRECTORIO]
```

2. Instalar las dependencias:
```bash
npm install
```

3. Configurar la base de datos:
   - Abrir SQL Server Management Studio
   - Ejecutar el script ubicado en `/sql/schema.sql`
   - Actualizar las credenciales de la base de datos en `/backend/server.js`

4. Iniciar el servidor:
```bash
npm start
```

## Configuración de la Base de Datos

1. Abrir el archivo `/backend/server.js`
2. Modificar la configuración de la base de datos:
```javascript
const dbConfig = {
    user: 'tu_usuario',
    password: 'tu_contraseña',
    server: 'localhost',
    database: 'PortafolioWeb',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};
```

## Desarrollo

Para iniciar el servidor en modo desarrollo con recarga automática:
```bash
npm run dev
```

## API Endpoints

### Proyectos
- `GET /api/proyectos` - Obtener todos los proyectos
- `GET /api/proyectos/:id` - Obtener un proyecto específico
- `POST /api/proyectos` - Crear un nuevo proyecto
- `PUT /api/proyectos/:id` - Actualizar un proyecto
- `DELETE /api/proyectos/:id` - Eliminar un proyecto

### Comentarios
- `GET /api/comentarios/:proyectoId` - Obtener comentarios de un proyecto
- `POST /api/comentarios` - Agregar un nuevo comentario

## Personalización

### Estilos
Los estilos principales se encuentran en:
- `/frontend/css/styles.css` - Estilos globales
- `/frontend/css/proyecto.css` - Estilos específicos de la página de proyecto

### JavaScript
- `/frontend/js/main.js` - Funcionalidad general del sitio
- `/frontend/js/proyecto.js` - Funcionalidad específica de la página de proyecto

## Seguridad

- Todas las consultas SQL utilizan parámetros para prevenir inyección SQL
- Se implementa CORS para controlar el acceso al API
- Las contraseñas y credenciales sensibles deben almacenarse en variables de entorno

## Contribución

1. Fork el proyecto
2. Crea una rama para tu función (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.