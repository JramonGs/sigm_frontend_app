// --- Marca como Componente de Cliente ---
'use client';

import React from 'react'; // Importamos React.
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_proveedores, obtener_productos, crear_compra } from '@/servicios/api_servicio'; // Importamos las funciones de API.

export default function PaginaRegistrarCompra() {
    const { esta_autenticado } = useAuth();

    // --- Estados para cargar datos ---
    const [proveedores, definir_proveedores] = React.useState([]); // Estado para los proveedores.
    const [productos_disponibles, definir_productos_disponibles] = React.useState([]); // Estado para los productos disponibles.
    const [cargando_datos, definir_cargando_datos] = React.useState(true); // Estado de carga de datos.
    const [error_carga, definir_error_carga] = React.useState(null); // Estado de error de carga.

    // --- Estados para el formulario de compra ---
    const [proveedor_seleccionado_id, definir_proveedor_seleccionado_id] = React.useState(''); // Estado para el proveedor seleccionado.
    const [lineas_compra, definir_lineas_compra] = React.useState([]); // { producto_id, nombre, cantidad, costo_unitario, subtotal }
    const [total_compra, definir_total_compra] = React.useState(0); // Estado para el total de la compra.

    // --- Estados para añadir línea ---
    const [producto_seleccionado, definir_producto_seleccionado] = React.useState(null); // Estado para el producto seleccionado.
    const [termino_busqueda, definir_termino_busqueda] = React.useState(''); // Estado para el termino de busqueda.
    const [cantidad_a_agregar, definir_cantidad_a_agregar] = React.useState(1); // Estado para la cantidad a agregar.
    const [costo_unitario_a_agregar, definir_costo_unitario_a_agregar] = React.useState(0); // Estado para el costo unitario a agregar.

    // --- Estados para mensajes y carga ---
    const [error_formulario, definir_error_formulario] = React.useState(null); // Estado de error del formulario.
    const [registrando, definir_registrando] = React.useState(false); // Estado de registro.
    const [mensaje_exito, definir_mensaje_exito] = React.useState(null); // Estado de mensaje de exito.

    // --- Efecto para Cargar Proveedores y Productos ---
    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_datos_iniciales = async () => {
                try {
                    definir_cargando_datos(true);
                    const [datos_prov, datos_prod] = await Promise.all([
                        obtener_proveedores(),
                        obtener_productos()
                    ]);
                    definir_proveedores(datos_prov);
                    definir_productos_disponibles(datos_prod);
                    definir_error_carga(null);
                } catch (error) {
                    console.error("Error al cargar datos iniciales:", error);
                    definir_error_carga("No se pudieron cargar proveedores o productos.");
                } finally {
                    definir_cargando_datos(false);
                }
            };
            cargar_datos_iniciales();
        }
    }, [esta_autenticado]);

    // --- Efecto para Recalcular el Total ---
    React.useEffect(() => {
        const nuevo_total = lineas_compra.reduce((acc, linea) => acc + linea.subtotal, 0);
        definir_total_compra(nuevo_total);
    }, [lineas_compra]);

    // --- Filtro de productos para búsqueda ---
    const productos_filtrados = React.useMemo(() => {
        if (!termino_busqueda) return [];
        const termino_lower = termino_busqueda.toLowerCase();
        return productos_disponibles.filter(p =>
            p.nombre.toLowerCase().includes(termino_lower)
        ).slice(0, 5);
    }, [productos_disponibles, termino_busqueda]);

    const seleccionar_producto_para_agregar = (producto) => {
        definir_producto_seleccionado(producto);
        definir_termino_busqueda(producto.nombre);
    };

    // --- Función para Agregar un Producto a la Compra ---
    const agregar_linea_compra = () => {
        definir_error_formulario(null);
        if (!producto_seleccionado || cantidad_a_agregar <= 0 || costo_unitario_a_agregar < 0) {
            definir_error_formulario("Selecciona un producto, cantidad válida y costo.");
            return;
        }

        const ya_existe = lineas_compra.find(linea => linea.producto_id === producto_seleccionado.id);
        if (ya_existe) {
            definir_error_formulario("Este producto ya está en la lista de compra.");
            return;
        }

        const nueva_linea = {
            producto_id: producto_seleccionado.id,
            nombre: producto_seleccionado.nombre,
            cantidad: parseInt(cantidad_a_agregar, 10),
            costo_unitario: parseFloat(costo_unitario_a_agregar),
            subtotal: parseFloat(costo_unitario_a_agregar) * parseInt(cantidad_a_agregar, 10)
        };

        definir_lineas_compra([...lineas_compra, nueva_linea]);

        // Limpia campos
        definir_termino_busqueda('');
        definir_producto_seleccionado(null);
        definir_cantidad_a_agregar(1);
        definir_costo_unitario_a_agregar(0);
    };

    // --- Función para Eliminar una Línea de Compra ---
    const eliminar_linea_compra = (producto_id) => {
        definir_lineas_compra(lineas_compra.filter(linea => linea.producto_id !== producto_id));
    };

    // --- Función para Registrar la Compra Final ---
    const manejar_registrar_compra = async () => {
        definir_error_formulario(null);
        definir_mensaje_exito(null);

        if (lineas_compra.length === 0) {
            definir_error_formulario("Debes agregar al menos un producto.");
            return;
        }

        definir_registrando(true);

        try {
            const datos_api = {
                proveedor_id: proveedor_seleccionado_id ? parseInt(proveedor_seleccionado_id, 10) : null,
                productos: lineas_compra.map(linea => ({
                    producto_id: linea.producto_id,
                    cantidad: linea.cantidad,
                    costo_unitario: linea.costo_unitario
                }))
            };

            const resultado = await crear_compra(datos_api);
            definir_mensaje_exito(`Compra #${resultado.compra_id} registrada. Total: $${resultado.total.toFixed(2)}`);

            // Limpia todo
            definir_proveedor_seleccionado_id('');
            definir_lineas_compra([]);
            
            // Recarga los productos para actualizar inventarios en el buscador
            const productos_actualizados = await obtener_productos();
            definir_productos_disponibles(productos_actualizados);

        } catch (error) {
            console.error("Error al registrar compra:", error);
            definir_error_formulario(error.response?.data?.error || "Ocurrió un error al registrar la compra.");
        } finally {
            definir_registrando(false);
        }
    };

    // --- Renderizado ---
    if (cargando_datos) return <p className="text-gray-600">Cargando datos...</p>;
    if (error_carga) return <p className="text-red-600">{error_carga}</p>;

    return (
        <div>
            <h1 className="text-4xl font-extrabold text-blue-700 mb-8 border-b border-gray-200 pb-4">Registrar Nueva Compra</h1>

            {/* --- Selección de Proveedor --- */}
            <div className="mb-6 p-4 bg-white rounded shadow">
                <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor (Opcional)
                </label>
                <select
                    id="proveedor"
                    value={proveedor_seleccionado_id}
                    onChange={(e) => definir_proveedor_seleccionado_id(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                    <option value="">-- Compra General / Sin Proveedor --</option>
                    {proveedores.map(prov => (
                        <option key={prov.id} value={prov.id}>
                            {prov.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* --- Agregar Productos --- */}
            <div className="mb-6 p-4 bg-white rounded shadow relative">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Agregar Productos</h2>
                {error_formulario && <p className="text-red-500 mb-3 text-sm">{error_formulario}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* Busqueda */}
                    <div className="md:col-span-2">
                        <label htmlFor="producto_buscar" className="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                        <input
                            type="text"
                            id="producto_buscar"
                            value={termino_busqueda}
                            onChange={(e) => {
                                definir_termino_busqueda(e.target.value);
                                definir_producto_seleccionado(null);
                            }}
                            placeholder="Escribe el nombre del producto..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            autoComplete="off"
                        />
                        {/* Lista de Resultados */}
                        {termino_busqueda && productos_filtrados.length > 0 && !producto_seleccionado && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {productos_filtrados.map(p => (
                                    <li
                                        key={p.id}
                                        onClick={() => seleccionar_producto_para_agregar(p)}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-black"
                                    >
                                        {p.nombre} (Inv: {p.inventario})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Cantidad */}
                    <div>
                        <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input
                            type="number"
                            id="cantidad"
                            value={cantidad_a_agregar}
                            onChange={(e) => definir_cantidad_a_agregar(e.target.value)}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>

                    {/* Costo Unitario */}
                    <div>
                        <label htmlFor="costo_unitario" className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario ($)</label>
                        <input
                            type="number"
                            id="costo_unitario"
                            value={costo_unitario_a_agregar}
                            onChange={(e) => definir_costo_unitario_a_agregar(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    
                    {/* Botón Agregar */}
                    <div>
                        <button
                            type="button"
                            onClick={agregar_linea_compra}
                            disabled={!producto_seleccionado}
                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Tabla de Líneas de Compra (Canasta) --- */}
            <div className="mb-6 bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {lineas_compra.length > 0 ? (
                            lineas_compra.map(linea => (
                                <tr key={linea.producto_id}>
                                    <td className="px-4 py-2 whitespace-nowrap">{linea.nombre}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{linea.cantidad}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">${linea.costo_unitario.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">${linea.subtotal.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center">
                                        <button onClick={() => eliminar_linea_compra(linea.producto_id)} className="text-red-600 hover:text-red-800 text-xs">Quitar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-4 py-2 text-center text-gray-500">Agrega productos a la compra...</td></tr>
                        )}
                    </tbody>
                    {/* Pie de tabla con el total */}
                    {lineas_compra.length > 0 && (
                        <tfoot className="bg-gray-50">
                            <tr><td colSpan="3" className="px-4 py-2 text-right font-medium text-gray-700 uppercase">Total:</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">${total_compra.toFixed(2)}</td>
                                <td></td>
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
                    onClick={manejar_registrar_compra}
                    disabled={registrando || lineas_compra.length === 0}
                    className={`py-2 px-6 font-semibold rounded-lg text-white ${registrando || lineas_compra.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {registrando ? 'Registrando...' : 'Confirmar Compra'}
                </button>
            </div>
        </div>
    );
}