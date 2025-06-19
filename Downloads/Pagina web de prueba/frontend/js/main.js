// Constantes para la API
const API_URL = 'http://localhost:3000/api';

// Funciones de utilidad
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function showError(message) {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3');
    toastContainer.style.zIndex = '1050';
    
    const toastEl = document.createElement('div');
    toastEl.classList.add('toast', 'align-items-center', 'text-white', 'bg-danger', 'border-0');
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-exclamation-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    document.body.appendChild(toastContainer);
    
    const toast = new bootstrap.Toast(toastEl, {
        animation: true,
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

// Animaciones de scroll suave para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Actualizar la navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        this.classList.add('active');
    });
});

// Animación del navbar al hacer scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else if (currentScroll < lastScroll || currentScroll <= 100) {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Función para cargar los proyectos con animaciones
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/proyectos`);
        const proyectos = await response.json();
        
        const container = document.querySelector('#proyectos .row');
        container.innerHTML = '';
        
        proyectos.forEach((proyecto, index) => {
            const delay = index * 200;
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 animate__animated animate__fadeInUp';
            card.style.animationDelay = `${delay}ms`;
            
            card.innerHTML = `
                <div class="card h-100 bg-dark border-0 shadow-lg">
                    <img src="assets/img/project${index + 1}.svg" class="card-img-top p-3" alt="${proyecto.Nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${proyecto.Nombre}</h5>
                        <p class="card-text text-muted">${proyecto.Descripcion}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">${formatDate(proyecto.FechaPublicacion)}</small>
                            <a href="proyecto.html?id=${proyecto.Id}" class="btn btn-primary">Ver más</a>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    } catch (error) {
        showError('Error al cargar los proyectos: ' + error.message);
    }
}

// Cargar proyectos cuando el documento esté listo
document.addEventListener('DOMContentLoaded', loadProjects);

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Añadir sombra al navbar cuando se hace scroll
    if (currentScroll > 50) {
        navbar.classList.add('shadow-lg');
        navbar.style.backgroundColor = 'rgba(33, 37, 41, 0.95)';
    } else {
        navbar.classList.remove('shadow-lg');
        navbar.style.backgroundColor = 'rgb(33, 37, 41)';
    }

    // Actualizar el enlace activo en la navegación según la sección visible
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
            document.querySelector(`.nav-link[href="#${section.id}"]`)?.classList.add('active');
        } else {
            document.querySelector(`.nav-link[href="#${section.id}"]`)?.classList.remove('active');
        }
    });

    lastScroll = currentScroll;
});

// Animación de entrada para las tarjetas de proyectos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Cargar proyectos desde la API
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/proyectos`);
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        
        const projects = await response.json();
        const projectsContainer = document.querySelector('.row');
        projectsContainer.innerHTML = '';

        projects.forEach((project, index) => {
            const projectCol = document.createElement('div');
            projectCol.className = `col-md-6 animate__animated ${index % 2 === 0 ? 'animate__fadeInLeft' : 'animate__fadeInRight'}`;
            projectCol.innerHTML = `
                <div class="card h-100 bg-dark border-light project-card">
                    <img src="${project.imagen_preview}" class="card-img-top" alt="${project.nombre}">
                    <div class="card-body">
                        <h3 class="card-title h4">${project.nombre}</h3>
                        <p class="card-text">${project.descripcion_corta}</p>
                        <div class="d-flex gap-2">
                            <a href="proyecto.html?id=${project.id}" class="btn btn-primary">
                                <i class="bi bi-info-circle me-2"></i>Ver Detalles
                            </a>
                            <a href="${project.enlace_descarga}" class="btn btn-outline-light">
                                <i class="bi bi-download me-2"></i>Descargar
                            </a>
                        </div>
                    </div>
                </div>
            `;

            projectsContainer.appendChild(projectCol);
            observer.observe(projectCol);
        });
    } catch (error) {
        showError('Error al cargar los proyectos: ' + error.message);
    }
}