// Funcionalidad principal del sitio
class TourismSite {
  constructor() {
    this.scrollTimer = null;
    this.currentAnnouncement = null; // Variable para rastrear el anuncio actual
    this.init();
  }

  init() {
    this.updateHeaderHeight();
    this.setupIntersectionObserver();
    this.setupSmoothScrolling();
    this.setupNavigationHighlight();
    this.setupAccessibility();

    // Actualizar altura del header al redimensionar
    window.addEventListener('resize', this.updateHeaderHeight.bind(this));
    
    // Actualizar altura al cargar completamente
    window.addEventListener('load', this.updateHeaderHeight.bind(this));
  }

  // Actualizar altura del header
  updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
      document.body.style.paddingTop = `${height}px`;
    }
  }

  // Observador para animaciones al hacer scroll
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.card').forEach(card => {
      observer.observe(card);
    });
  }

  // Navegación suave entre secciones
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  // Resaltar navegación activa
  setupNavigationHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    const headerHeight = document.querySelector('header').offsetHeight;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
          });
          
          const activeLink = document.querySelector(`.nav-list a[href="#${id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
          }
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: `-${headerHeight}px 0px 0px 0px`
    });

    sections.forEach(section => {
      observer.observe(section);
    });
  }

  // Mejoras de accesibilidad
  setupAccessibility() {
    // Manejo de teclado para navegación
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Anunciar cambios de página para lectores de pantalla
    const announcePageChange = (message) => {
      // Eliminar el anuncio existente si lo hay
      if (this.currentAnnouncement) {
        document.body.removeChild(this.currentAnnouncement);
        this.currentAnnouncement = null;
      }

      // Crear un nuevo anuncio
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only'; // Ocultar visualmente pero accesible para lectores de pantalla
      announcement.textContent = message;
      document.body.appendChild(announcement);
      this.currentAnnouncement = announcement;

      // Eliminar el anuncio después de 1 segundo
      setTimeout(() => {
        if (this.currentAnnouncement) {
          document.body.removeChild(this.currentAnnouncement);
          this.currentAnnouncement = null;
        }
      }, 1000);
    };

    // Detectar cambios de sección con debounce
    const handleSectionChange = () => {
      const visibleSection = Array.from(document.querySelectorAll('section[id]'))
        .find(section => {
          const rect = section.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        });
      
      if (visibleSection) {
        const title = visibleSection.querySelector('h2')?.textContent || visibleSection.id;
        announcePageChange(`Ahora viendo: ${title}`);
      }
    };

    // Función de debounce para limitar la frecuencia de los eventos de scroll
    const debounce = (func, wait) => {
      let timeout;
      return function() {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
      };
    };

    // Usar debounce en el evento de scroll
    window.addEventListener('scroll', debounce(handleSectionChange, 200));

    // Inicializar al cargar
    setTimeout(handleSectionChange, 500);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new TourismSite();
});

// Manejador de errores global
window.addEventListener('error', (e) => {
  console.error('Error en la aplicación:', e.error);
});