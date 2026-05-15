/**
 * GProA - Sistema de Punto de Venta Distribuidor IA
 * Script.js - Lógica principal de la aplicación
 */

// ============ DOM ELEMENTS ============
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const mainContainer = document.querySelector('.main-container');
const sectionTitle = document.getElementById('section-title');
const sectionSubtitle = document.getElementById('section-subtitle');
const modalOverlay = document.getElementById('modalOverlay');
const newSaleBtn = document.getElementById('new-sale-btn');
const modalClose = document.querySelector('.modal-close');
const tabButtons = document.querySelectorAll('.tab-btn');

// ============ SECCIÓN TITLES ============
const sectionTitles = {
    'dashboard': { title: 'Dashboard', subtitle: 'Bienvenido a GProA Sistema de Punto de Venta' },
    'sales': { title: 'Punto de Venta', subtitle: 'Gestión de ventas y transacciones' },
    'inventory': { title: 'Inventario', subtitle: 'Control de productos y stock' },
    'warehouse': { title: 'Bodega', subtitle: 'Gestión de almacenamiento y movimientos' },
    'traceability': { title: 'Trazabilidad', subtitle: 'Rastreo completo de productos' },
    'employees': { title: 'Trabajadores', subtitle: 'Gestión de personal y roles' },
    'permissions': { title: 'Roles y Permisos', subtitle: 'Control de acceso y autorización' },
    'reports': { title: 'Reportes', subtitle: 'Análisis e informes del negocio' },
    'ai-analytics': { title: 'AI Analytics', subtitle: 'Inteligencia artificial para tu negocio' }
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeEventListeners();
    initializeAnimations();
    initializeAPIData(); // Cargar datos reales
    simulateLiveData();
});

// ============ NAVEGACIÓN ============
function initializeNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            navigateToSection(sectionId);
        });
    });

    // Establecer dashboard como activo por defecto
    navigateToSection('dashboard');
}

function navigateToSection(sectionId) {
    // Remover clase active de todos los items
    navItems.forEach(item => item.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));

    // Agregar clase active al item seleccionado
    const selectedItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }

    // Mostrar la sección correspondiente
    const sectionElement = document.getElementById(`${sectionId}-section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
        
        // Actualizar título
        if (sectionTitles[sectionId]) {
            sectionTitle.textContent = sectionTitles[sectionId].title;
            sectionSubtitle.textContent = sectionTitles[sectionId].subtitle;
        }

        // Scroll hacia arriba
        window.scrollTo(0, 0);
    }
}

// ============ EVENT LISTENERS ============
function initializeEventListeners() {
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Modal de nueva venta
    if (newSaleBtn) {
        newSaleBtn.addEventListener('click', openModal);
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Botones de acción
    addActionButtonListeners();

    // Búsqueda en tiempo real
    initializeSearch();
}

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    mainContainer.classList.toggle('sidebar-closed');
}

function openModal() {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchTab(tabName) {
    const tabBtns = document.querySelectorAll('[data-tab]');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Aquí puedes agregar lógica para cambiar contenido
    console.log(`Cambió a tab: ${tabName}`);
}

function addActionButtonListeners() {
    const actionBtns = document.querySelectorAll('.action-btn, .action-btn-full');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Acción ejecutada correctamente', 'success');
        });
    });
}

function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function(e) {
            const query = this.value.toLowerCase();
            if (query.length > 0) {
                console.log(`Buscando: ${query}`);
            }
        });
    });
}

// ============ ANIMACIONES ============
function initializeAnimations() {
    // Observador de intersección para animaciones al scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.5s ease-in forwards';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.kpi-card, .chart-card, .activity-card').forEach(el => {
        observer.observe(el);
    });

    // Animación de contadores
    animateCounters();
}

function animateCounters() {
    const countElements = document.querySelectorAll('.kpi-value');
    countElements.forEach(el => {
        const text = el.textContent;
        const isPrice = text.includes('$');
        const isBigNumber = text.includes(',');
        
        // Animar números
        if (isPrice || isBigNumber) {
            el.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'all 0.3s ease';
            });
            
            el.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        }
    });
}

// ============ DATOS EN VIVO (SIMULADOS) ============
function simulateLiveData() {
    setInterval(() => {
        updateSalesMetrics();
        updateActivityFeed();
        updateStockAlerts();
    }, 5000); // Actualizar cada 5 segundos
}

function updateSalesMetrics() {
    const salesElement = document.querySelector('.kpi-card.sales .kpi-value');
    if (salesElement) {
        const current = parseFloat(salesElement.textContent.replace('$', '').replace(',', ''));
        const variation = (Math.random() - 0.4) * 500; // Variación aleatoria
        const newValue = (current + variation).toFixed(2);
        
        // Efecto de cambio
        salesElement.style.color = variation > 0 ? '#10b981' : '#ef4444';
        setTimeout(() => {
            salesElement.style.color = 'var(--text-primary)';
        }, 500);
    }
}

function updateActivityFeed() {
    // Simular nuevas actividades
    const activities = [
        { icon: 'fa-cash-register', title: 'Venta registrada', desc: 'Nueva transacción completada', type: 'sale' },
        { icon: 'fa-cube', title: 'Entrada de inventario', desc: 'Nuevos productos recibidos', type: 'stock' },
        { icon: 'fa-user-plus', title: 'Nuevo movimiento', desc: 'Registro de actividad', type: 'user' },
        { icon: 'fa-exchange-alt', title: 'Transferencia registrada', desc: 'Movimiento entre bodegas', type: 'transfer' }
    ];
    
    if (Math.random() > 0.7) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        console.log(`Nueva actividad: ${activity.title}`);
    }
}

function updateStockAlerts() {
    // Simular alertas de stock
    const stockItems = document.querySelectorAll('.stock-item');
    if (stockItems.length > 0) {
        const randomItem = stockItems[Math.floor(Math.random() * stockItems.length)];
        if (randomItem) {
            randomItem.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            setTimeout(() => {
                randomItem.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }, 1000);
        }
    }
}

// ============ NOTIFICACIONES ============
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos inline
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: var(--shadow);
    `;
    
    // Agregar estilos de color según tipo
    if (type === 'success') {
        notification.style.borderLeftColor = 'var(--color-success)';
        notification.style.borderLeftWidth = '3px';
    } else if (type === 'error') {
        notification.style.borderLeftColor = 'var(--color-danger)';
        notification.style.borderLeftWidth = '3px';
    } else if (type === 'warning') {
        notification.style.borderLeftColor = 'var(--color-warning)';
        notification.style.borderLeftWidth = '3px';
    }
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ============ UTILIDADES ============
function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('es-ES').format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// ============ ESTADÍSTICAS DINÁMICAS ============
function generateRandomMetrics() {
    return {
        sales: Math.floor(Math.random() * 100000),
        products: Math.floor(Math.random() * 5000),
        transactions: Math.floor(Math.random() * 100),
        employees: Math.floor(Math.random() * 20)
    };
}

// ============ EXPORTAR DATOS ============
function exportToCSV() {
    showNotification('Exportando datos a CSV...', 'info');
    // Aquí iría la lógica real de exportación
    setTimeout(() => {
        showNotification('Archivo descargado correctamente', 'success');
    }, 2000);
}

function exportToPDF() {
    showNotification('Generando PDF...', 'info');
    // Aquí iría la lógica real de exportación
    setTimeout(() => {
        showNotification('PDF generado correctamente', 'success');
    }, 2000);
}

// ============ FILTROS Y BÚSQUEDA ============
function filterTable(table, query) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ============ VALIDACIONES DE FORMULARIOS ============
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhone(phone) {
    const regex = /^[\d\s\-\+\(\)]{7,}$/;
    return regex.test(phone);
}

// ============ TEMAS Y PERSONALIZACIÓN ============
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K para búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-box input').focus();
    }
    
    // ESC para cerrar modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + E para exportar
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportToCSV();
    }
});

// ============ CÁLCULOS Y MÉTRICAS ============
function calculateTotalSales() {
    // Función para calcular total de ventas
    return 45230.50;
}

function calculateAverageSalesPerTransaction() {
    // Función para calcular promedio por transacción
    return 1616.09;
}

function getTopSellingProducts() {
    // Función para obtener productos más vendidos
    return [
        { name: 'Leche Integral 1L', units: 500 },
        { name: 'Pan Integral 600g', units: 450 },
        { name: 'Cereal Premium 500g', units: 320 },
        { name: 'Queso Fresco 200g', units: 280 }
    ];
}

// ============ API CLIENT REAL ============
class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la solicitud');
            }
            
            return data;
        } catch (error) {
            console.error(`Error en ${endpoint}:`, error);
            throw error;
        }
    }

    // Dashboard
    async getDashboardMetrics() {
        return this.request('/dashboard/metrics');
    }

    async getSystemStatus() {
        return this.request('/status');
    }

    // Inventory
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/inventory/products${query ? '?' + query : ''}`);
    }

    async createProduct(product) {
        return this.request('/inventory/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
    }

    async updateProduct(id, product) {
        return this.request(`/inventory/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    }

    async deleteProduct(id) {
        return this.request(`/inventory/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Sales
    async getSales(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/sales${query ? '?' + query : ''}`);
    }

    async createSale(sale) {
        return this.request('/sales', {
            method: 'POST',
            body: JSON.stringify(sale)
        });
    }

    // Warehouse
    async getMovements(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/warehouse/movements/list${query ? '?' + query : ''}`);
    }

    async createMovement(movement) {
        return this.request('/warehouse/movements', {
            method: 'POST',
            body: JSON.stringify(movement)
        });
    }

    // Reports
    async getReports(type) {
        return this.request(`/reports/${type}`);
    }

    async exportReport(type, format) {
        return this.request(`/reports/export?type=${type}&format=${format}`);
    }

    // Health
    async getHealth() {
        return this.request('/health');
    }
}

// Instancia del cliente API
const apiClient = new APIClient();

// ============ INICIALIZACIÓN DE API ============
async function initializeAPIData() {
    try {
        // Cargar datos reales del dashboard
        const [metrics, health] = await Promise.all([
            apiClient.getDashboardMetrics(),
            apiClient.getHealth()
        ]);

        console.log('Datos cargados:', { metrics, health });
        
        // Actualizar UI con datos reales
        updateDashboardWithRealData(metrics);
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showNotification('Error al cargar datos - usando datos offline', 'warning');
    }
}

// Actualizar dashboard con datos reales
function updateDashboardWithRealData(metrics) {
    if (!metrics || !metrics.data) return;
    
    const data = metrics.data;
    
    // Actualizar KPIs
    const salesElement = document.querySelector('.kpi-card.sales .kpi-value');
    if (salesElement && data.totalSales !== undefined) {
        salesElement.textContent = formatCurrency(data.totalSales);
    }
    
    const transactionsElement = document.querySelector('.kpi-card.transactions .kpi-value');
    if (transactionsElement && data.totalTransactions !== undefined) {
        transactionsElement.textContent = formatNumber(data.totalTransactions);
    }
    
    const productsElement = document.querySelector('.kpi-card.products .kpi-value');
    if (productsElement && data.totalProducts !== undefined) {
        productsElement.textContent = formatNumber(data.totalProducts);
    }
}

// ============ GRÁFICOS (PLACEHOLDER PARA FUTURAS LIBRERÍAS) ============
function initializeCharts() {
    // Este es un placeholder para futuras integraciones con Chart.js o similar
    console.log('Gráficos inicializados');
    
    // Aquí se pueden integrar librerías como:
    // - Chart.js para gráficos
    // - D3.js para visualizaciones avanzadas
    // - ApexCharts para gráficos interactivos
}

// ============ SOPORTE OFFLINE ============
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service Worker no disponible');
    });
}

// ============ MONITOREO DE PERFORMANCE ============
function logPerformanceMetrics() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Tiempo de carga: ${pageLoadTime}ms`);
    }
}

// Ejecutar al cargar la página
window.addEventListener('load', logPerformanceMetrics);

// ============ ATAJOS DE NAVEGACIÓN ============
window.gproaApp = {
    navigate: navigateToSection,
    openModal: openModal,
    closeModal: closeModal,
    notify: showNotification,
    api: apiClient,
    formatCurrency: formatCurrency,
    formatNumber: formatNumber
};

console.log('%c GProA Sistema de Punto de Venta', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%c Versión 1.0.0 - Modo Demo', 'color: #8b5cf6; font-size: 12px;');
console.log('Disponible: window.gproaApp');
