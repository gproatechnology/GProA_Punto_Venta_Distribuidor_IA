/**
 * GProA - RBAC Configuration
 * backend/config/rbacConfig.js
 */

// Roles disponibles
const ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    WAREHOUSE: 'warehouse',
    SELLER: 'seller',
    AUDITOR: 'auditor'
};

// Permisos por rol
const PERMISSIONS = {
    [ROLES.ADMIN]: {
        users: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        sales: ['create', 'read', 'update', 'delete'],
        warehouse: ['create', 'read', 'update', 'delete'],
        reports: ['create', 'read', 'update', 'delete'],
        dashboard: ['read'],
        system: ['read', 'update']
    },
    [ROLES.SUPERVISOR]: {
        users: ['read'],
        inventory: ['create', 'read', 'update'],
        sales: ['create', 'read', 'update'],
        warehouse: ['create', 'read', 'update'],
        reports: ['create', 'read'],
        dashboard: ['read'],
        system: ['read']
    },
    [ROLES.WAREHOUSE]: {
        inventory: ['create', 'read', 'update'],
        warehouse: ['create', 'read', 'update'],
        reports: ['read'],
        dashboard: ['read'],
        system: ['read']
    },
    [ROLES.SELLER]: {
        sales: ['create', 'read'],
        inventory: ['read'],
        dashboard: ['read'],
        system: ['read']
    },
    [ROLES.AUDITOR]: {
        users: ['read'],
        inventory: ['read'],
        sales: ['read'],
        warehouse: ['read'],
        reports: ['read'],
        dashboard: ['read'],
        system: ['read']
    }
};

// Mapeo de endpoints a recursos
const ENDPOINT_RESOURCES = {
    'GET /api/users': 'users',
    'POST /api/users': 'users',
    'PUT /api/users/:id': 'users',
    'DELETE /api/users/:id': 'users',
    'GET /api/inventory': 'inventory',
    'POST /api/inventory': 'inventory',
    'PUT /api/inventory/:id': 'inventory',
    'DELETE /api/inventory/:id': 'inventory',
    'GET /api/sales': 'sales',
    'POST /api/sales': 'sales',
    'PUT /api/sales/:id': 'sales',
    'DELETE /api/sales/:id': 'sales',
    'GET /api/warehouse': 'warehouse',
    'POST /api/warehouse': 'warehouse',
    'PUT /api/warehouse/:id': 'warehouse',
    'DELETE /api/warehouse/:id': 'warehouse',
    'GET /api/reports': 'reports',
    'POST /api/reports': 'reports',
    'GET /api/dashboard': 'dashboard',
    'GET /api/metrics': 'system',
    'GET /api/health': 'system',
    'GET /api/status': 'system'
};

// Verificar permiso
const hasPermission = (role, resource, action) => {
    const rolePermissions = PERMISSIONS[role];
    if (!rolePermissions) return false;
    
    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;
    
    return resourcePermissions.includes(action);
};

// Verificar acceso a endpoint
const canAccessEndpoint = (role, method, path) => {
    // Normalizar path
    const normalizedPath = path.replace(/\/\d+/g, '/:id');
    const endpointKey = `${method} ${normalizedPath.split('?')[0]}`;
    
    const resource = ENDPOINT_RESOURCES[endpointKey];
    if (!resource) {
        // Si no está mapeado, permitir por defecto (para nuevos endpoints)
        return true;
    }
    
    const action = getActionFromMethod(method);
    return hasPermission(role, resource, action);
};

// Obtener acción del método HTTP
const getActionFromMethod = (method) => {
    const methodActions = {
        GET: 'read',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete'
    };
    return methodActions[method] || 'read';
};

// Obtener permisos del rol
const getRolePermissions = (role) => {
    return PERMISSIONS[role] || {};
};

// Obtener todos los roles
const getAllRoles = () => {
    return Object.values(ROLES);
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ENDPOINT_RESOURCES,
    hasPermission,
    canAccessEndpoint,
    getRolePermissions,
    getAllRoles
};