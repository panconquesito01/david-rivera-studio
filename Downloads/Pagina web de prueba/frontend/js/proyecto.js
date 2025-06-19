// Obtener el ID del proyecto de la URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

// Elementos del DOM
const projectTitle = document.getElementById('projectTitle');
const projectDate = document.getElementById('projectDate');
const projectDescription = document.getElementById('projectDescription');
const projectCategories = document.getElementById('projectCategories');
const projectGallery = document.getElementById('projectGallery');
const projectVideo = document.getElementById('projectVideo');
const downloadButton = document.getElementById('downloadButton');
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');

// Cargar los detalles del proyecto
async function cargarDetallesProyecto() {
    try {
        const response = await fetch(`${API_BASE_URL}/proyectos/${projectId}`);
        if (!response.ok) throw new Error('Error al cargar los detalles del proyecto');
        
        const proyecto = await response.json();
        
        // Actualizar la información del proyecto
        document.title = `${proyecto.Nombre} - Mi Portafolio`;
        proyectoTitulo.textContent = proyecto.Nombre;
        proyectoFecha.textContent = `Fecha de publicación: ${formatDate(proyecto.FechaPublicacion)}`;
        proyectoImagen.src = proyecto.ImagenPrincipal;
        proyectoImagen.alt = proyecto.Nombre;
        proyectoDescripcion.textContent = proyecto.Descripcion;
        enlaceDescarga.href = proyecto.EnlaceDescarga;

        // Cargar categorías
        if (proyecto.Categorias && proyecto.Categorias.length > 0) {
            proyectoCategorias.innerHTML = proyecto.Categorias
                .map(categoria => `<span class="tag">${categoria}</span>`)
                .join('');
        }

        // Cargar galería de imágenes si existe
        if (proyecto.Galeria && proyecto.Galeria.length > 0) {
            galeriaImagenes.innerHTML = proyecto.Galeria
                .map(imagen => `
                    <img src="${imagen}" alt="${proyecto.Nombre}" 
                         onclick="mostrarImagenCompleta('${imagen}')"
                    >
                `).join('');
        }

        // Cargar video si existe
        if (proyecto.VideoDemo) {
            if (proyecto.VideoDemo.includes('youtube.com')) {
                // Extraer ID del video de YouTube
                const videoId = proyecto.VideoDemo.split('v=')[1];
                videoContainer.innerHTML = `
                    <iframe src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                `;
            } else {
                // Video local
                videoContainer.innerHTML = `
                    <video controls>
                        <source src="${proyecto.VideoDemo}" type="video/mp4">
                        Tu navegador no soporta el elemento de video.
                    </video>
                `;
            }
        }

    } catch (error) {
        showError('No se pudo cargar la información del proyecto');
        console.error('Error:', error);
    }
}

// Cargar comentarios del proyecto
async function cargarComentarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/comentarios/${projectId}`);
        if (!response.ok) throw new Error('Error al cargar los comentarios');
        
        const comentarios = await response.json();
        
        listaComentarios.innerHTML = comentarios
            .map(comentario => `
                <div class="comentario">
                    <div class="comentario-header">
                        <span class="comentario-autor">${comentario.Usuario}</span>
                        <span class="comentario-fecha">${formatDate(comentario.Fecha)}</span>
                    </div>
                    <p>${comentario.Comentario}</p>
                </div>
            `)
            .join('');

    } catch (error) {
        showError('No se pudieron cargar los comentarios');
        console.error('Error:', error);
    }
}

// Manejar el envío de nuevos comentarios
comentarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById('nombre');
    const comentarioInput = document.getElementById('comentario');

    const nuevoComentario = {
        ProyectoId: parseInt(projectId),
        Usuario: nombreInput.value,
        Comentario: comentarioInput.value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoComentario)
        });

        if (!response.ok) throw new Error('Error al enviar el comentario');

        // Limpiar el formulario
        nombreInput.value = '';
        comentarioInput.value = '';

        // Recargar los comentarios
        await cargarComentarios();

    } catch (error) {
        showError('No se pudo enviar el comentario');
        console.error('Error:', error);
    }
});

// Función para mostrar imagen en tamaño completo
function mostrarImagenCompleta(src) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="${src}" alt="Imagen en tamaño completo">
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close').onclick = () => {
        document.body.removeChild(modal);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Inicializar la página
if (projectId) {
    cargarDetallesProyecto();
    cargarComentarios();
} else {
    showError('No se especificó un proyecto válido');
}