const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
    server: 'localhost',
    database: 'PortafolioWeb',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        trustedConnection: true // Para Windows Authentication
    }
};

// Función para conectar a la base de datos
async function conectarDB() {
    try {
        await sql.connect(dbConfig);
        console.log('Conexión exitosa a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    }
}

// Endpoints para Proyectos

// Obtener todos los proyectos
app.get('/api/proyectos', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT p.*, 
                   STRING_AGG(c.Nombre, ',') AS Categorias
            FROM Proyectos p
            LEFT JOIN ProyectoCategoria pc ON p.Id = pc.ProyectoId
            LEFT JOIN Categorias c ON pc.CategoriaId = c.Id
            GROUP BY p.Id, p.Nombre, p.Descripcion, p.FechaPublicacion, 
                     p.ImagenPrincipal, p.VideoDemo, p.EnlaceDescarga
        `;
        
        const proyectos = result.recordset.map(proyecto => ({
            ...proyecto,
            Categorias: proyecto.Categorias ? proyecto.Categorias.split(',') : []
        }));

        res.json(proyectos);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
});

// Obtener un proyecto específico
app.get('/api/proyectos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql.query`
            SELECT p.*, 
                   STRING_AGG(c.Nombre, ',') AS Categorias
            FROM Proyectos p
            LEFT JOIN ProyectoCategoria pc ON p.Id = pc.ProyectoId
            LEFT JOIN Categorias c ON pc.CategoriaId = c.Id
            WHERE p.Id = ${id}
            GROUP BY p.Id, p.Nombre, p.Descripcion, p.FechaPublicacion, 
                     p.ImagenPrincipal, p.VideoDemo, p.EnlaceDescarga
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const proyecto = {
            ...result.recordset[0],
            Categorias: result.recordset[0].Categorias ? 
                       result.recordset[0].Categorias.split(',') : []
        };

        res.json(proyecto);
    } catch (error) {
        console.error('Error al obtener el proyecto:', error);
        res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
});

// Crear un nuevo proyecto
app.post('/api/proyectos', async (req, res) => {
    try {
        const {
            Nombre,
            Descripcion,
            FechaPublicacion,
            ImagenPrincipal,
            VideoDemo,
            EnlaceDescarga,
            Categorias
        } = req.body;

        const pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Insertar proyecto
            const resultProyecto = await new sql.Request(transaction)
                .input('nombre', sql.NVarChar, Nombre)
                .input('descripcion', sql.NVarChar, Descripcion)
                .input('fechaPublicacion', sql.Date, FechaPublicacion)
                .input('imagenPrincipal', sql.NVarChar, ImagenPrincipal)
                .input('videoDemo', sql.NVarChar, VideoDemo)
                .input('enlaceDescarga', sql.NVarChar, EnlaceDescarga)
                .query(`
                    INSERT INTO Proyectos (Nombre, Descripcion, FechaPublicacion, 
                                         ImagenPrincipal, VideoDemo, EnlaceDescarga)
                    OUTPUT INSERTED.Id
                    VALUES (@nombre, @descripcion, @fechaPublicacion, 
                            @imagenPrincipal, @videoDemo, @enlaceDescarga)
                `);

            const proyectoId = resultProyecto.recordset[0].Id;

            // Insertar categorías
            if (Categorias && Categorias.length > 0) {
                for (const categoria of Categorias) {
                    // Verificar si la categoría existe o crear una nueva
                    const resultCategoria = await new sql.Request(transaction)
                        .input('nombre', sql.NVarChar, categoria)
                        .query(`
                            MERGE Categorias AS target
                            USING (SELECT @nombre AS Nombre) AS source
                            ON target.Nombre = source.Nombre
                            WHEN NOT MATCHED THEN
                                INSERT (Nombre) VALUES (@nombre)
                            OUTPUT INSERTED.Id;
                        `);

                    const categoriaId = resultCategoria.recordset[0].Id;

                    // Crear relación proyecto-categoría
                    await new sql.Request(transaction)
                        .input('proyectoId', sql.Int, proyectoId)
                        .input('categoriaId', sql.Int, categoriaId)
                        .query(`
                            INSERT INTO ProyectoCategoria (ProyectoId, CategoriaId)
                            VALUES (@proyectoId, @categoriaId)
                        `);
                }
            }

            await transaction.commit();
            res.status(201).json({ id: proyectoId, message: 'Proyecto creado exitosamente' });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error al crear el proyecto:', error);
        res.status(500).json({ error: 'Error al crear el proyecto' });
    }
});

// Actualizar un proyecto
app.put('/api/proyectos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Nombre,
            Descripcion,
            FechaPublicacion,
            ImagenPrincipal,
            VideoDemo,
            EnlaceDescarga,
            Categorias
        } = req.body;

        const pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Actualizar proyecto
            await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .input('nombre', sql.NVarChar, Nombre)
                .input('descripcion', sql.NVarChar, Descripcion)
                .input('fechaPublicacion', sql.Date, FechaPublicacion)
                .input('imagenPrincipal', sql.NVarChar, ImagenPrincipal)
                .input('videoDemo', sql.NVarChar, VideoDemo)
                .input('enlaceDescarga', sql.NVarChar, EnlaceDescarga)
                .query(`
                    UPDATE Proyectos
                    SET Nombre = @nombre,
                        Descripcion = @descripcion,
                        FechaPublicacion = @fechaPublicacion,
                        ImagenPrincipal = @imagenPrincipal,
                        VideoDemo = @videoDemo,
                        EnlaceDescarga = @enlaceDescarga
                    WHERE Id = @id
                `);

            // Eliminar categorías existentes
            await new sql.Request(transaction)
                .input('proyectoId', sql.Int, id)
                .query('DELETE FROM ProyectoCategoria WHERE ProyectoId = @proyectoId');

            // Insertar nuevas categorías
            if (Categorias && Categorias.length > 0) {
                for (const categoria of Categorias) {
                    const resultCategoria = await new sql.Request(transaction)
                        .input('nombre', sql.NVarChar, categoria)
                        .query(`
                            MERGE Categorias AS target
                            USING (SELECT @nombre AS Nombre) AS source
                            ON target.Nombre = source.Nombre
                            WHEN NOT MATCHED THEN
                                INSERT (Nombre) VALUES (@nombre)
                            OUTPUT INSERTED.Id;
                        `);

                    const categoriaId = resultCategoria.recordset[0].Id;

                    await new sql.Request(transaction)
                        .input('proyectoId', sql.Int, id)
                        .input('categoriaId', sql.Int, categoriaId)
                        .query(`
                            INSERT INTO ProyectoCategoria (ProyectoId, CategoriaId)
                            VALUES (@proyectoId, @categoriaId)
                        `);
                }
            }

            await transaction.commit();
            res.json({ message: 'Proyecto actualizado exitosamente' });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error al actualizar el proyecto:', error);
        res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
});

// Eliminar un proyecto
app.delete('/api/proyectos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // Eliminar relaciones con categorías
            await new sql.Request(transaction)
                .input('proyectoId', sql.Int, id)
                .query('DELETE FROM ProyectoCategoria WHERE ProyectoId = @proyectoId');

            // Eliminar comentarios
            await new sql.Request(transaction)
                .input('proyectoId', sql.Int, id)
                .query('DELETE FROM Comentarios WHERE ProyectoId = @proyectoId');

            // Eliminar proyecto
            await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('DELETE FROM Proyectos WHERE Id = @id');

            await transaction.commit();
            res.json({ message: 'Proyecto eliminado exitosamente' });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
        res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
});

// Endpoints para Comentarios

// Obtener comentarios de un proyecto
app.get('/api/comentarios/:proyectoId', async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const result = await sql.query`
            SELECT * FROM Comentarios
            WHERE ProyectoId = ${proyectoId}
            ORDER BY Fecha DESC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ error: 'Error al obtener los comentarios' });
    }
});

// Agregar un comentario
app.post('/api/comentarios', async (req, res) => {
    try {
        const { ProyectoId, Usuario, Comentario } = req.body;

        await sql.query`
            INSERT INTO Comentarios (ProyectoId, Usuario, Comentario)
            VALUES (${ProyectoId}, ${Usuario}, ${Comentario})
        `;

        res.status(201).json({ message: 'Comentario agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        res.status(500).json({ error: 'Error al agregar el comentario' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

conectarDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});