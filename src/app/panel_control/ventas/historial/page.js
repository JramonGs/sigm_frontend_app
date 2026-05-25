// --- Marca como Componente de Cliente ---
'use client';

import React from 'react'; // importa useEffect.
import { useAuth } from '@/contexto/auth_contexto'; // Importa el hook de autenticacion.
import { obtener_historial_ventas, obtener_clientes } from '@/servicios/api_servicio'; // Importa la funcion para obtener el historial.
import Link from 'next/link'; // Importacion de navegacion.

export default function PaginaHistorialVentas() {
    const { esta_autenticado } = useAuth(); // Hook de autenticacion.
    
    // --- Estados de Datos ---
    const [historial, definir_historial] = React.useState([]); // Historial de ventas.
    const [listaClientes, definir_listaClientes] = React.useState([]); // Para el select

    // --- Estados de Filtros ---
    const [filtros, definir_filtros] = React.useState({ // Filtros de busqueda.
        fecha_inicio: '',
        fecha_fin: '',
        cliente_id: '',
        venta_id: ''
    });

    const [cargando, definir_cargando] = React.useState(true); // Estado de carga.
    const [error_carga, definir_error_carga] = React.useState(null); // Estado de error de carga.

    // Carga inicial (Clientes y Ventas sin filtro)
    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_datos = async () => {
                try {
                    definir_cargando(true);
                    const [ventasData, clientesData] = await Promise.all([
                        obtener_historial_ventas(), // Carga todo al inicio
                        obtener_clientes()
                    ]);
                    definir_historial(ventasData);
                    definir_listaClientes(clientesData);
                    definir_error_carga(null);
                } catch (error) {
                    console.error("Error:", error);
                    definir_error_carga("No se pudo cargar el historial.");
                } finally {
                    definir_cargando(false);
                }
            };
            cargar_datos();
        }
    }, [esta_autenticado]); // Efecto depende de esta_autenticado.

    // Función para ejecutar la búsqueda
    const manejar_busqueda = async (e) => {
        e.preventDefault(); // Evita recargar la página
        definir_cargando(true);
        try {
            // Enviamos el estado 'filtros' limpio (sin vacíos innecesarios)
            const filtros_activos = {};
            for (const key in filtros) {
                if (filtros[key]) filtros_activos[key] = filtros[key];
            }

            const resultados = await obtener_historial_ventas(filtros_activos);
            definir_historial(resultados);
        } catch (error) {
            alert("Error al buscar ventas.");
        } finally {
            definir_cargando(false);
        }
    };

    const manejar_cambio_filtro = (e) => {
        definir_filtros({ ...filtros, [e.target.name]: e.target.value });
    };

    const limpiar_filtros = async () => {
        const filtros_limpios = { fecha_inicio: '', fecha_fin: '', cliente_id: '', venta_id: '' };
        definir_filtros(filtros_limpios);
        // Recargar todo
        definir_cargando(true);
        const data = await obtener_historial_ventas();
        definir_historial(data);
        definir_cargando(false);
    };

    if (cargando && !historial.length) return <p className="text-gray-600">Cargando...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Historial de Ventas</h1>

            {/* --- BARRA DE BÚSQUEDA --- */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <form onSubmit={manejar_busqueda} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    
                    {/* Filtro ID */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Folio Venta</label>
                        <input 
                            type="number" name="venta_id" 
                            value={filtros.venta_id} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black" placeholder="#"
                        />
                    </div>

                    {/* Filtro Cliente */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                        <select 
                            name="cliente_id" 
                            value={filtros.cliente_id} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black"
                        >
                            <option value="">-- Todos --</option>
                            {listaClientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Fechas */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                        <input 
                            type="date" name="fecha_inicio" 
                            value={filtros.fecha_inicio} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                        <input 
                            type="date" name="fecha_fin" 
                            value={filtros.fecha_fin} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black" 
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-full">
                            Buscar
                        </button>
                        <button type="button" onClick={limpiar_filtros} className="bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400">
                            ✕
                        </button>
                    </div>
                </form>
            </div>

            {/* --- TABLA --- */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {historial.length > 0 ? (
                            historial.map((venta) => (
                                <tr key={venta.id}>
                                    <td className="px-6 py-4 font-medium">{venta.id}</td>
                                    <td className="px-6 py-4">{venta.fecha}</td>
                                    <td className="px-6 py-4">{venta.cliente}</td>
                                    <td className="px-6 py-4 text-right font-semibold">${venta.total}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/panel_control/ventas/historial/${venta.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            Ver Detalles
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No se encontraron ventas con estos filtros.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}