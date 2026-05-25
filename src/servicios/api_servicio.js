import axios from 'axios'; // Importa axios.

// --- Crea una instancia de Axios ---
const instancia_api = axios.create({
    // Define la URL base de tu API back-end.
    //baseURL: 'http://localhost:3001/api', // URL base de la API.
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// --- Interceptor de Peticiones ---
// Esta función se ejecuta ANTES de que cada petición sea enviada.
instancia_api.interceptors.request.use(
    (config) => {
        // 1. Intenta obtener el token del localStorage.
        const token = localStorage.getItem('token_jwt'); 

        // 2. Si existe el token, lo añadimos al encabezado 'Authorization'.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // 3. Retorna la configuración modificada (o la original si no había token).
        return config;
    },
    (error) => {
        // Maneja errores en la configuración de la petición.
        return Promise.reject(error);
    }
);

// --- Funciones para interactuar con la API ---
// En lugar de usar axios.get(...) , usamos instancia_api.get(...).
export const obtener_productos = async (params = {}) => {
    try {
        const respuesta = await instancia_api.get('/productos', { params });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        throw error; // Propaga el error para que el componente lo maneje.
    }
};

// Función para crear un nuevo producto.
export const crear_producto = async (datos_producto) => {
    try {
        const respuesta = await instancia_api.post('/productos', datos_producto);
        return respuesta.data;
    } catch (error) {
        console.error('Error al crear producto:', error);
        throw error; 
    }
};

// Función para crear las ventas.
export const crear_venta = async (datos_venta) => {
    try {
        const respuesta = await instancia_api.post('/ventas', datos_venta);
        return respuesta.data;
    } catch (error) {
        console.error('Error al crear venta:', error);
        throw error;
    }
};

// Función para actualizar un producto existente.
export const actualizar_producto = async (id, datos_actualizados) => {
    try {
        // Usamos PUT y añadimos el ID al final de la URL.
        const respuesta = await instancia_api.put(`/productos/${id}`, datos_actualizados);
        return respuesta.data;
    } catch (error) {
        console.error(`Error al actualizar producto ${id}:`, error);
        throw error;
    }
};

// Función para eliminar un producto por su ID.
export const eliminar_producto = async (id) => {
    try {
        // Usamos DELETE y añadimos el ID al final de la URL.
        const respuesta = await instancia_api.delete(`/productos/${id}`);
        return respuesta.data; // Devuelve el mensaje de éxito del backend.
    } catch (error) {
        console.error(`Error al eliminar producto ${id}:`, error);
        throw error;
    }
};

// Funcion para obtener clientes.
export const obtener_clientes = async (params = {}) => {
    try {
        const respuesta = await instancia_api.get('/clientes', { params });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error; 
    }
};

// Funcion para crear un cliente.
export const crear_cliente = async (datos_cliente) => {
    try {
        const respuesta = await instancia_api.post('/clientes', datos_cliente);
        return respuesta.data;
    } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error; 
    }
};

// Funcion para actualizar un cliente(requiere ID).
export const actualizar_cliente = async (id, datos_actualizados) => {
    try {
        const respuesta = await instancia_api.put(`/clientes/${id}`, datos_actualizados);
        return respuesta.data;
    } catch (error) {
        console.error(`Error al actualizar cliente ${id}:`, error);
        throw error;
    }
};

// Funcion para eliminar un cliente(requiere ID).
export const eliminar_cliente = async (id) => {
    try {
        const respuesta = await instancia_api.delete(`/clientes/${id}`);
        return respuesta.data; 
    } catch (error) {
        console.error(`Error al eliminar cliente ${id}:`, error);
        throw error;
    }
};

// Funcion para obtener el inventario.
export const obtener_inventario_bajo = async () => {
    try {
        const respuesta = await instancia_api.get('/reportes/inventario_bajo');
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener inventario bajo:', error);
        throw error; 
    }
};

// Funcion para obtener las vistas recientes.
export const obtener_ventas_recientes = async () => {
    try {
        const respuesta = await instancia_api.get('/reportes/ventas_recientes');
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener ventas recientes:', error);
        throw error; 
    }
};

// Funcion para obtener el historial de ventas.
export const obtener_historial_ventas = async (filtros = {}) => {
    try {
        // Axios se encarga de convertir el objeto 'filtros' en query params (?fecha_inicio=...&cliente_id=...)
        const respuesta = await instancia_api.get('/ventas',{ params: filtros}); // Llama al endpoint GET /api/ventas
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener historial de ventas:', error);
        throw error;
    }
};

// Función para crear un nuevo usuario (requiere rol Gerente).
export const crear_usuario = async (datos_usuario) => {
    try {
        const respuesta = await instancia_api.post('/usuarios', datos_usuario);
        return respuesta.data;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error; // Propaga el error para manejo en el componente
    }
};

// Función para obtener los detalles de una venta específica por su ID.
export const obtener_detalle_venta = async (id_venta) => {
    try {
        const respuesta = await instancia_api.get(`/ventas/${id_venta}`); // Llama al nuevo endpoint GET /api/ventas/:id
        return respuesta.data;
    } catch (error) {
        console.error(`Error al obtener detalles de la venta ${id_venta}:`, error);
        throw error;
    }
};

// Función para obtener los detalles de una compra específica por su ID.
export const obtener_detalle_compra = async (id_compra) => {
    try {
        const respuesta = await instancia_api.get(`/compras/${id_compra}`); // Llama al endpoint GET /api/compras/:id
        return respuesta.data;
    } catch (error) {
        console.error(`Error al obtener detalles de la compra ${id_compra}:`, error);
        throw error;
    }
};

// Función para obtener la lista de usuarios (requiere rol Gerente)
export const obtener_usuarios = async () => {
    try {
        const respuesta = await instancia_api.get('/usuarios'); // Llama al nuevo endpoint GET /api/usuarios
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

// Función para actualizar el rol de un usuario (requiere rol Gerente)
export const actualizar_usuario = async (id_usuario, datos_actualizados) => {
    try {
        // Por ahora, datos_actualizados solo contendrá { rol: 'NuevoRol' }
        const respuesta = await instancia_api.put(`/usuarios/${id_usuario}`, datos_actualizados);
        return respuesta.data;
    } catch (error) {
        console.error(`Error al actualizar usuario ${id_usuario}:`, error);
        throw error;
    }
};

// Función para eliminar un usuario (requiere rol Gerente)
export const eliminar_usuario = async (id_usuario) => {
    try {
        const respuesta = await instancia_api.delete(`/usuarios/${id_usuario}`);
        return respuesta.data; // Devuelve el mensaje de éxito del backend
    } catch (error) {
        console.error(`Error al eliminar usuario ${id_usuario}:`, error);
        throw error;
    }
};

// Funcion para obtener proveedores.
export const obtener_proveedores = async (params = {}) => {
    try {
        const respuesta = await instancia_api.get('/proveedores', { params });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        throw error;
    }
};

// Funcionan para crear proveedor.
export const crear_proveedor = async (datos_proveedor) => {
    try {
        const respuesta = await instancia_api.post('/proveedores', datos_proveedor);
        return respuesta.data;
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        throw error;
    }
};

// Funcion para actualizar un proveedor.
export const actualizar_proveedor = async (id, datos_actualizados) => {
    try {
        const respuesta = await instancia_api.put(`/proveedores/${id}`, datos_actualizados);
        return respuesta.data;
    } catch (error) {
        console.error(`Error al actualizar proveedor ${id}:`, error);
        throw error;
    }
};

// Funcionar para eliminar un proveedor.
export const eliminar_proveedor = async (id) => {
    try {
        const respuesta = await instancia_api.delete(`/proveedores/${id}`);
        return respuesta.data;
    } catch (error) {
        console.error(`Error al eliminar proveedor ${id}:`, error);
        throw error;
    }
};

// Funcion para crear una compra.
export const crear_compra = async (datos_compra) => {
    try {
        const respuesta = await instancia_api.post('/compras', datos_compra);
        return respuesta.data;
    } catch (error) {
        console.error('Error al registrar compra:', error);
        throw error;
    }
};

// Funcion para obtener el historial de compras.
export const obtener_historial_compras = async (filtros = {}) => {
    try {
        // Axios se encarga de convertir el objeto 'filtros' en query params (?fecha_inicio=...&cliente_id=...)
        const respuesta = await instancia_api.get('/compras',{ params: filtros });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener historial de compras:', error);
        throw error;
    }
};

// Funcion para obtener las ventas recientes filtradas por fechas.
export const obtener_ventas_filtradas = async (fecha_inicio, fecha_fin) => {
    try {
        // Pasamos las fechas como "query parameters"
        const respuesta = await instancia_api.get('/reportes/ventas_filtradas', {
            params: { fecha_inicio, fecha_fin }
        });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener ventas filtradas:', error);
        throw error;
    }
};

// Funcion para obtener las compras recientes filtradas por fechas.
export const obtener_compras_filtradas = async (fecha_inicio, fecha_fin) => {
    try {
        const respuesta = await instancia_api.get('/reportes/compras_filtradas', {
            params: { fecha_inicio, fecha_fin }
        });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener compras filtradas:', error);
        throw error;
    }
};

// ========== ANALYTICS - MACHINE LEARNING ==========

// Dashboard general de analytics
export const obtener_dashboard_analytics = async () => {
    try {
        const respuesta = await instancia_api.get('/analytics/dashboard');
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener dashboard analytics:', error);
        throw error;
    }
};

// Las funciones predictivas basadas en regresión lineal (ml-regression) han sido retiradas de esta versión Single-Tenant.

// Top clientes
export const obtener_top_clientes = async (limite = 10) => {
    try {
        const respuesta = await instancia_api.get('/analytics/top-clientes', {
            params: { limite }
        });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener top clientes:', error);
        throw error;
    }
};

// Alerta de stock (versión analytics - más completa que obtener_inventario_bajo)
export const obtener_alerta_stock_analytics = async (umbral = 10) => {
    try {
        const respuesta = await instancia_api.get('/analytics/alerta-stock', {
            params: { umbral }
        });
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener alerta de stock:', error);
        throw error;
    }
};

// Obtener estadísticas de rendimiento individual del Empleado
export const obtener_stats_empleado = async () => {
    try {
        const respuesta = await instancia_api.get('/analytics/empleado');
        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener estadísticas del empleado:', error);
        throw error;
    }
};

// Exportamos la instancia para usarla directamente.
export default instancia_api;