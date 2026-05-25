// --- Marca como Componente de Cliente ---
'use client';

import React from 'react'; // Hooks de react.
import { useAuth} from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_clientes, obtener_productos, crear_venta } from '@/servicios/api_servicio';  // Funciones API.

// --- Componente Principal ---
export default function PaginaRegistrarVenta() {

    const { esta_autenticado } = useAuth(); // Hook de autenticacion.

    // --- Estados para cargar datos ---
    const [clientes, definir_clientes] = React.useState([]); // Lista de clientes desde la API.
    const [productos_disponibles, definir_productos_disponibles] = React.useState([]); // Lista de productos desde la API.
    const [cargando_datos, definir_cargando_datos] = React.useState(true); // Estado de carga inicial.
    const [error_carga, definir_error_carga] = React.useState(null); // Errores de carga inicial.

    // --- Estados para el formulario de venta ---
    const [cliente_seleccionado_id, definir_cliente_seleccionado_id] = React.useState(''); // ID del cliente o '' si es venta general
    const [lineas_venta, definir_lineas_venta] = React.useState([]); // Array [{ producto_id, nombre, cantidad, precio_unitario, subtotal }]
    const [cantidad_a_agregar, definir_cantidad_a_agregar] = React.useState(1); // Cantidad del producto a agregar.
    const [termino_busqueda_producto, definir_termino_busqueda_producto] = React.useState(''); // Termino de busqueda para productos.
    const [producto_seleccionado_para_agregar, definir_producto_seleccionado_para_agregar] = React.useState(null); // Guarda el objeto producto completo
    const [total_venta, definir_total_venta] = React.useState(0); // Total calculado de la venta.

    // --- Estados para mensajes y carga ---
    const [error_formulario, definir_error_formulario] = React.useState(null); // Errores en el formulario de venta.
    const [registrando_venta, definir_registrando_venta] = React.useState(false); // Estado de carga al registrar la venta.
    const [mensaje_exito, definir_mensaje_exito] = React.useState(null); // Mensaje de exito al registrar la venta.

    // --- Efecto para Cargar Clientes y Productos ---
    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_datos_iniciales = async () => {
                try {
                    definir_cargando_datos(true); // Inicia la carga.
                    // Carga clientes y productos en paralelo
                    const [datos_clientes, datos_productos] = await Promise.all([
                        obtener_clientes(),
                        obtener_productos()
                    ]);
                    definir_clientes(datos_clientes);
                    definir_productos_disponibles(datos_productos);
                    definir_error_carga(null);
                } catch (error) {
                    console.error("Error al cargar datos iniciales:", error);
                    definir_error_carga("No se pudieron cargar clientes o productos.");
                } finally {
                    definir_cargando_datos(false); // Finaliza la carga.
                }
            };
            cargar_datos_iniciales();
        }
    }, [esta_autenticado]);

    // --- Efecto para Recalcular el Total ---
    React.useEffect(() => {
        const nuevo_total = lineas_venta.reduce((acumulado, linea) => acumulado + linea.subtotal, 0);
        definir_total_venta(nuevo_total);
    }, [lineas_venta]); // Se recalcula cada vez que cambian las líneas de venta

    // useMemo "recuerda" el resultado del filtro y solo lo recalcula si
    // productos_disponibles o termino_busqueda_producto cambian. Es más eficiente.
    const productos_filtrados = React.useMemo(() => {
        if (!termino_busqueda_producto) {
            return []; // No muestra nada si no hay búsqueda
        }
        const termino_lower = termino_busqueda_producto.toLowerCase();
        return productos_disponibles.filter(producto =>
            producto.nombre.toLowerCase().includes(termino_lower) && producto.inventario > 0 // Solo muestra si hay stock
        ).slice(0, 5); // Limita a mostrar 5 resultados para no saturar
    }, [productos_disponibles, termino_busqueda_producto]);

    // --- Función para seleccionar un producto de la lista filtrada ---
    const seleccionar_producto = (producto) => {
        definir_producto_seleccionado_para_agregar(producto);
        definir_termino_busqueda_producto(producto.nombre); // Pone el nombre en el input
        // Opcional:Limpiar la lista de filtrados aquí para que desaparezca al seleccionar.
    };

    // --- Función para Agregar un Producto a la Venta ---
    const agregar_linea_venta = () => {
        definir_error_formulario(null);
        // Ahora valida usando producto_seleccionado_para_agregar
        if (!producto_seleccionado_para_agregar || cantidad_a_agregar <= 0) {
            definir_error_formulario("Selecciona un producto de la lista y una cantidad válida.");
            return;
        }

        // El producto ya lo tenemos en el estado
        const producto_seleccionado = producto_seleccionado_para_agregar;

        const ya_existe = lineas_venta.find(linea => linea.producto_id === producto_seleccionado.id);
        if (ya_existe) {
            definir_error_formulario("Este producto ya está en la venta.");
            return;
        }

        if (producto_seleccionado.inventario < cantidad_a_agregar) {
            definir_error_formulario(`Inventario insuficiente para ${producto_seleccionado.nombre} (Disponible: ${producto_seleccionado.inventario}).`);
            return;
        }

        const nueva_linea = {
            producto_id: producto_seleccionado.id,
            nombre: producto_seleccionado.nombre,
            cantidad: parseInt(cantidad_a_agregar, 10),
            precio_unitario: parseFloat(producto_seleccionado.precio),
            subtotal: parseFloat(producto_seleccionado.precio) * parseInt(cantidad_a_agregar, 10)
        };

        definir_lineas_venta([...lineas_venta, nueva_linea]);

        // Limpia los campos de agregar producto
        definir_termino_busqueda_producto(''); // Limpia el input de búsqueda
        definir_producto_seleccionado_para_agregar(null); // Limpia la selección
        definir_cantidad_a_agregar(1);
    };

    // --- Función para Eliminar una Línea de Venta ---
    const eliminar_linea_venta = (producto_id_a_eliminar) => {
        definir_lineas_venta(lineas_venta.filter(linea => linea.producto_id !== producto_id_a_eliminar));
    };

    // --- Función para Registrar la Venta Final ---
    const manejar_registrar_venta = async () => {
        definir_error_formulario(null);
        definir_mensaje_exito(null);

        if (lineas_venta.length === 0) {
            definir_error_formulario("Debes agregar al menos un producto a la venta.");
            return;
        }

        definir_registrando_venta(true); // Indica que está procesando

        try {
            const datos_venta_api = {
                // Envía null si no se seleccionó cliente, o el ID convertido a número
                cliente_id: cliente_seleccionado_id ? parseInt(cliente_seleccionado_id, 10) : null,
                // Mapea solo los campos que necesita la API
                productos_vendidos: lineas_venta.map(linea => ({
                    producto_id: linea.producto_id,
                    cantidad: linea.cantidad
                }))
            };

            const resultado_venta = await crear_venta(datos_venta_api);
            definir_mensaje_exito(`Venta #${resultado_venta.venta_id} registrada con éxito. Total: $${resultado_venta.total.toFixed(2)}`);

            // Limpia todo para una nueva venta
            definir_cliente_seleccionado_id('');
            definir_lineas_venta([]);

            // Recarga los productos para actualizar inventarios.
            try {
                // Volvemos a llamar a la API para obtener la lista actualizada
                const productos_actualizados = await obtener_productos();
                // Actualizamos el estado que usa el selector de productos
                definir_productos_disponibles(productos_actualizados); 
            } catch (error_recarga) {
                // Si falla la recarga, no es crítico, pero informamos en consola
                console.error("Error al recargar productos después de la venta:", error_recarga);
                definir_error_formulario("Venta registrada, pero ocurrió un error al actualizar la lista de productos."); 
            }
        } catch (error) {
            console.error("Error al registrar venta:", error);
            if (error.response?.data?.error) {
                definir_error_formulario(`Error: ${error.response.data.error}`);
            } else {
                definir_error_formulario("Ocurrió un error al registrar la venta.");
            }
        } finally {
            definir_registrando_venta(false); // Termina el proceso
        }
    };

    // --- Renderizado ---
    if (cargando_datos) return <p className="text-gray-600">Cargando datos...</p>;
    if (error_carga) return <p className="text-red-600">{error_carga}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Registrar Nueva Venta</h1>

            {/* --- Sección de Selección de Cliente --- */}
            <div className="mb-6 p-4 bg-white rounded shadow">
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente (Opcional)
                </label>
                <select
                    id="cliente"
                    value={cliente_seleccionado_id}
                    onChange={(e) => definir_cliente_seleccionado_id(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                    <option value="">-- Venta General --</option>
                    {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.telefono ? `(${cliente.telefono})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* --- Sección para Agregar Productos --- */}
            <div className="mb-6 p-4 bg-white rounded shadow relative">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Agregar Productos</h2>
                {error_formulario && <p className="text-red-500 mb-3 text-sm">{error_formulario}</p>}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Busqueda de producto. */}
                    <div className="md:col-span-2">
                        <label htmlFor="producto_buscar" className="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                        <input
                            type="text"
                            id="producto_buscar"
                            value={termino_busqueda_producto}
                            onChange={(e) => {
                                definir_termino_busqueda_producto(e.target.value);
                                definir_producto_seleccionado_para_agregar(null); // Limpia selección si escribe de nuevo
                            }}
                            placeholder="Escribe el nombre del producto..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            autoComplete="off" // Evita autocompletado del navegador
                        />
                        {/* Lista de Resultados Filtrados. */}
                        {termino_busqueda_producto && productos_filtrados.length > 0 && !producto_seleccionado_para_agregar && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {productos_filtrados.map(producto => (
                                    <li
                                        key={producto.id}
                                        onClick={() => seleccionar_producto(producto)}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-black"
                                    >
                                        {producto.nombre} (Disp: {producto.inventario}) - ${parseFloat(producto.precio).toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {termino_busqueda_producto && productos_filtrados.length === 0 && !producto_seleccionado_para_agregar && (
                            <p className="text-xs text-gray-500 mt-1">No se encontraron productos.</p>
                        )}
                    </div>
                    {/* Cantidad */}
                    <div>
                        <label htmlFor="cantidad_agregar" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input
                            type="number"
                            id="cantidad_agregar"
                            value={cantidad_a_agregar}
                            onChange={(e) => definir_cantidad_a_agregar(e.target.value)}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    {/* Botón Agregar */}
                    <div>
                        <button
                            type="button" // Es importante que sea type="button" para no enviar el formulario principal
                            onClick={agregar_linea_venta}
                            disabled={!producto_seleccionado_para_agregar} // Solo habilita si hay un producto seleccionado.
                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Tabla de Líneas de Venta (Canasta) --- */}
            <div className="mb-6 bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {lineas_venta.length > 0 ? (
                            lineas_venta.map(linea => (
                                <tr key={linea.producto_id}>
                                    <td className="px-4 py-2 whitespace-nowrap">{linea.nombre}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{linea.cantidad}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">${linea.precio_unitario.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">${linea.subtotal.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center">
                                        <button onClick={() => eliminar_linea_venta(linea.producto_id)} className="text-red-600 hover:text-red-800 text-xs">Quitar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-4 py-2 text-center text-gray-500">Agrega productos a la venta...</td></tr>
                        )}
                    </tbody>
                    {/* Pie de tabla con el total */}
                    {lineas_venta.length > 0 && (
                        <tfoot className="bg-gray-50">
                            <tr><td colSpan="3" className="px-4 py-2 text-right font-medium text-gray-700 uppercase">Total:</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">${total_venta.toFixed(2)}</td>
                                <td></td> {/* Celda vacía para alinear */}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* --- Sección de Confirmación --- */}
            <div className="flex justify-end items-center">
                {mensaje_exito && <p className="text-green-600 mr-4">{mensaje_exito}</p>}
                <button
                    type="button"
                    onClick={manejar_registrar_venta}
                    disabled={registrando_venta || lineas_venta.length === 0}
                    className={`py-2 px-6 font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 ${registrando_venta || lineas_venta.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                >
                    {registrando_venta ? 'Registrando...' : 'Confirmar Venta'}
                </button>
            </div>

        </div>
    );
}