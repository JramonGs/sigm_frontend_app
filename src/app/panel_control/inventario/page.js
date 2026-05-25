// Marca como Componente de Cliente 
'use client';

import React from 'react'; // Importamos React.
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticación.
import { obtener_productos, crear_producto, actualizar_producto, eliminar_producto , obtener_proveedores} from '@/servicios/api_servicio'; // Importamos las funciones de API.


export default function PaginaInventario() {
    const { usuario_actual, esta_autenticado, cargando_auth } = useAuth(); // Para verificar si está autenticado (aunque el layout ya protege).
    
    // --- INICIO DE GUARDA DE AUTENTICACIÓN ---
    // Muestra "cargando" mientras el contexto verifica el token.
    // Esto previene que se intente leer 'usuario_actual.rol' cuando 'usuario_actual' es null.
    if (cargando_auth) {
        return <p className="text-gray-600">Verificando sesión...</p>;
    }
    // Si no está autenticado, no renderiza nada (el layout ya redirige)
    if (!esta_autenticado || !usuario_actual) {
        return <p className="text-red-600">Acceso denegado.</p>;
    }
    // --- FIN DE GUARDA DE AUTENTICACIÓN ---

    const [productos, definir_productos] = React.useState([]); // Estado para guardar la lista de productos.
    const [cargando, definir_cargando] = React.useState(true); // Estado para mostrar mensaje de carga.
    const [error_carga, definir_error_carga] = React.useState(null); // Estado para errores al cargar.
    
    // Estado para el formulario de Nuevo Producto 
    const [nuevo_nombre, definir_nuevo_nombre] = React.useState(''); // Nombre del nuevo producto.
    const [nuevo_inventario, definir_nuevo_inventario] = React.useState(0); // Iventario del nuevo producto.
    const [nuevo_precio, definir_nuevo_precio] = React.useState(0); // Precio del nuevo producto.
    const [nuevo_proveedor_id, definir_nuevo_proveedor_id] = React.useState(''); // Definimos un nuevo proveedor.
    const [error_formulario, definir_error_formulario] = React.useState(null); // Errores del formulario.

    // Estados para cargar las listas.
    const [proveedores, definir_proveedores] = React.useState([]); // Definimos proveedores.
    const [editando_producto_id, definir_editando_producto_id] = React.useState(null); // ID del producto que se esta editando.
    const [datos_edicion, definir_datos_edicion] = React.useState({ nombre: '', inventario: 0, precio: 0, proveedor_id:''}); // Datos del formulario de edición.
    const [error_edicion, definir_error_edicion] = React.useState(null); // Errores de edicion.
    const [guardando, definir_guardando] = React.useState(false); // Estado para indicar si está guardando la edición.
    
    const es_gerente = usuario_actual && usuario_actual.rol === 'Gerente'; // Verifica si el usuario es gerente.

    //  Efecto para Cargar los Productos al inicio.
    React.useEffect(() => {
        // Intentamos cargar si el usuario está autenticado.
        if (esta_autenticado) {
            const cargar_datos_iniciales = async () => {
                try {
                    definir_cargando(true);
                    
                    // Carga los datos de productos y proveedores.
                    const [datos_productos, datos_proveedores] = await Promise.all([
                        obtener_productos(),
                        obtener_proveedores()
                    ]); 
                    
                    definir_productos(datos_productos); // Guarda los productos
                    definir_proveedores(datos_proveedores); // Guarda los proveedores
                    definir_error_carga(null); // Limpia errores previos.
                } catch (error) {
                    console.error("Error al cargar datos:", error);
                    definir_error_carga("No se pudieron cargar los productos o proveedores.");
                } finally {
                    definir_cargando(false); // Termina la carga (con éxito o error).
                }
            };
            cargar_datos_iniciales(); // Llama a la funcion.
        }
    }, [esta_autenticado]); // Se ejecuta cuando cambia el estado de autenticación.

    // Función para manejar el envío del formulario.
    const manejar_agregar_producto = async (evento) => {
        evento.preventDefault();
        definir_error_formulario(null);

        // Validación simple.
        if (!nuevo_nombre || nuevo_inventario < 0 || nuevo_precio <= 0) {
            definir_error_formulario("Por favor, completa todos los campos correctamente.");
            return;
        }

        // Intenta crear el producto.
        try {
            const datos_nuevo_producto = {
                nombre: nuevo_nombre,
                inventario: parseInt(nuevo_inventario, 10), // Asegura que sea número.
                precio: parseFloat(nuevo_precio), // Asegura que sea número decimal.
                proveedor_id: nuevo_proveedor_id || null // Asegura que exista un proveedor.
            };
            await crear_producto(datos_nuevo_producto); // Llama a la API.

            // Recarga la lista de productos.
            const datos_productos_actualizados = await obtener_productos();
            definir_productos(datos_productos_actualizados); // Actualiza la lista.

            // Limpia el formulario.
            definir_nuevo_nombre('');
            definir_nuevo_inventario(0);
            definir_nuevo_precio(0);
            definir_nuevo_proveedor_id('');

        } catch (error) {
            console.error("Error al crear producto:", error);
            if (error.response && error.response.status === 403) {
                definir_error_formulario("No tienes permiso para crear productos (necesitas rol Gerente).");
            } else {
                definir_error_formulario("Error al guardar el producto.");
            }
        }
    };

    // Inicia la edición de un producto.
    const iniciar_edicion = (producto) => {
        definir_editando_producto_id(producto.id);
        definir_datos_edicion({ // Carga los datos actuales en el estado de edición.
            nombre: producto.nombre,
            inventario: producto.inventario,
            precio: producto.precio,
            proveedor_id: producto.proveedor_id || ''
        });
    };

    // Cancela la edición.
    const cancelar_edicion = () => {
        definir_editando_producto_id(null);
        definir_datos_edicion({ nombre: '', inventario: 0, precio: 0, proveedor_id: '' });
    };

    // Maneja los cambios en el formulario de edición.
    const manejar_cambio_edicion = (evento) => {
        const { name, value } = evento.target;
        definir_datos_edicion(prev => ({ ...prev, [name]: value }));
    };

    // Guarda los cambios de la edición.
    const guardar_edicion = async (id_producto) => {

        // Limpia errores previos.
        definir_error_edicion(null);
        
        // Indica que está guardando.
        definir_guardando(true);

        // Validacion simple.
        if (!datos_edicion.nombre || datos_edicion.inventario < 0 || datos_edicion.precio <= 0) {
            definir_error_edicion("Por favor, verifica los datos ingresados.");
            definir_guardando(false);
            return; 
        }

        // Intenta actualizar el producto.
        try {
            const datos_para_actualizar = {
                nombre: datos_edicion.nombre,
                inventario: parseInt(datos_edicion.inventario, 10),
                precio: parseFloat(datos_edicion.precio),
                proveedor_id: datos_edicion.proveedor_id || null
            };
            await actualizar_producto(id_producto, datos_para_actualizar);
            
            // Recarga la lista para ver los cambios (incluyendo el nombre del proveedor).
            const datos_productos_actualizados = await obtener_productos();
            definir_productos(datos_productos_actualizados);
            
            cancelar_edicion(); // Cierra el modo edición.

        } catch (error) {
            console.error("Error al actualizar producto:", error);
            definir_error_edicion("Error al guardar los cambios.");

        } finally{
            // Indica que ya no está guardando.
            definir_guardando(false);
        }
    };

    // Funcion para eliminar un producto.
    const manejar_eliminar_producto = async (id_producto) => {
        // Pregunta de confirmación.
        if (window.confirm(`¿Estás seguro de que quieres eliminar el producto ID ${id_producto}?`)) {
            try {
                await eliminar_producto(id_producto);
                // Actualiza la lista de productos localmente (quitando el eliminado).
                definir_productos(productos.filter(p => p.id !== id_producto));
            } catch (error) {
                console.error("Error al eliminar producto:", error);
                // Muestra el error del backend si no se pudo borrar (ej. por estar en ventas).
                if (error.response && error.response.data && error.response.data.error) {
                    alert(`Error: ${error.response.data.error}`);
                } else {
                    alert("Error al eliminar el producto.");
                }
            }
        }
    };

    //  Renderizado Condicional 
    if (cargando) {
        return <p className="text-gray-600">Cargando productos...</p>;
    }

    if (error_carga) {
        return <p className="text-red-600">{error_carga}</p>;
    }

    //  Renderizado Principal (Tabla y Formulario) 
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Inventario</h1>

            {/* Formulario para agregar productos (funcion unica para usuarios de tipo "Gerente") */}
            {es_gerente && ( // <-- Solo muestra el formulario si es Gerente
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Añadir Nuevo Producto</h2>
                    {error_formulario && (
                        <p className="text-red-500 mb-4">{error_formulario}</p>
                    )}
                    <form onSubmit={manejar_agregar_producto} className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nuevo_nombre}
                            onChange={(e) => definir_nuevo_nombre(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                        />
                        </div>

                        <div>
                        <label htmlFor="inventario" className="block text-sm font-medium text-gray-700 mb-1">Inventario</label>
                        <input
                            type="number"
                            id="inventario"
                            value={nuevo_inventario}
                            onChange={(e) => definir_nuevo_inventario(e.target.value)}
                            required
                            min="0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                        />
                        </div>

                        <div>
                        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                        <input
                            type="number"
                            id="precio"
                            value={nuevo_precio}
                            onChange={(e) => definir_nuevo_precio(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                        />
                        </div>
                        <div>
                            <label htmlFor="proveedor_id" className="block text-sm font-medium text-gray-700 mb-1">Proveedor (Opcional)</label>
                            <select
                                id="proveedor_id"
                                value={nuevo_proveedor_id}
                                onChange={(e) => definir_nuevo_proveedor_id(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white transition duration-150 ease-in-out hover:border-blue-400"
                            >
                                <option value="">-- Sin Proveedor --</option>
                                {proveedores.map((prov) => (
                                    <option key={prov.id} value={prov.id}>
                                        {prov.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Futuros inputs aqui.*/}
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white transition duration-150 ease-in-out"
                            >
                                Agregar Producto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla de productos. */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                            {/* Cabecera de accions */}
                            {es_gerente && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {productos.length > 0 ? (
                            productos.map((producto) => (
                                <tr key={producto.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    {/* Modo Edición (Solo si es Gerente) */}
                                    {es_gerente && editando_producto_id === producto.id ? ( 
                                        <>
                                            {/* Celdad editables. */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{producto.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <input type="text" name="nombre" value={datos_edicion.nombre} onChange={manejar_cambio_edicion} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"/>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <input type="number" name="inventario" value={datos_edicion.inventario} onChange={manejar_cambio_edicion} className="w-20 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"/>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowGrap text-sm">
                                                <input type="number" step="0.01" name="precio" value={datos_edicion.precio} onChange={manejar_cambio_edicion} className="w-24 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"/>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    name="proveedor_id"
                                                    value={datos_edicion.proveedor_id}
                                                    onChange={manejar_cambio_edicion}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm bg-white"
                                                >
                                                    <option value="">-- Sin Proveedor --</option>
                                                    {proveedores.map((prov) => (
                                                        <option key={prov.id} value={prov.id}>
                                                            {prov.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button onClick={() => guardar_edicion(producto.id)} disabled={guardando} className="text-green-600 hover:text-green-800 disabled:opacity-50">
                                                    {guardando ? 'Guardando...' : 'Guardar'}
                                                </button>
                                                <button onClick={cancelar_edicion} disabled={guardando} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">Cancelar</button>
                                                {error_edicion && <p className ="text-red-500 text-xs mt-1">{error_edicion}</p>}
                                            </td>
                                        </>
                                    ) : (
                                        // Modo Normal (Mostrar datos, acciones condicionales)
                                        <>
                                        {/* Celdas normales. */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{producto.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{producto.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{producto.inventario}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">${parseFloat(producto.precio).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{producto.nombre_proveedor || '-'}</td>
                                            {/* Botones de Acciones  */}
                                            {es_gerente && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button onClick={() => iniciar_edicion(producto)} className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">Editar</button>
                                                    <button onClick={() => manejar_eliminar_producto(producto.id)} className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out">Eliminar</button>
                                                </td>
                                            )}
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            // Mensaje "No hay productos" (Ahora necesita colspan 6 si es gerente, 5 si no)
                            <tr>
                                <td colSpan={es_gerente ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">No hay productos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}