// Marca como Componente de Cliente
'use client';

import React from 'react'; // Importamos React.
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_historial_compras, obtener_proveedores } from '@/servicios/api_servicio'; // Importamos las funciones de API.
import Link from 'next/link'; // Importacion de navegacion.

export default function PaginaHistorialCompras() {
    const { esta_autenticado, cargando_auth } = useAuth(); // Hook de autenticacion.
    
    // --- Estados de Datos ---
    const [historial, definir_historial] = React.useState([]); // Estado para el historial de compras.
    const [listaProveedores, definir_listaProveedores] = React.useState([]); // Para el select del filtro

    // --- Estados de Filtros ---
    const [filtros, definir_filtros] = React.useState({ // Estado para los filtros.
        fecha_inicio: '',
        fecha_fin: '',
        proveedor_id: '',
        compra_id: ''
    });

    const [cargando, definir_cargando] = React.useState(true); // Estado de carga.
    const [error_carga, definir_error_carga] = React.useState(null); // Estado de error de carga.

    // Carga inicial (Proveedores y Compras sin filtro)
    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_datos = async () => {
                try {
                    definir_cargando(true);
                    const [comprasData, proveedoresData] = await Promise.all([
                        obtener_historial_compras(), // Carga todo al inicio
                        obtener_proveedores()
                    ]);
                    definir_historial(comprasData);
                    definir_listaProveedores(proveedoresData);
                    definir_error_carga(null);
                } catch (error) {
                    console.error("Error al cargar historial:", error);
                    definir_error_carga("No se pudo cargar el historial de compras.");
                } finally {
                    definir_cargando(false);
                }
            };
            cargar_datos();
        }
    }, [esta_autenticado]);

    // Función para ejecutar la búsqueda
    const manejar_busqueda = async (e) => {
        e.preventDefault();
        definir_cargando(true);
        try {
            // Limpiamos filtros vacíos
            const filtros_activos = {};
            for (const key in filtros) {
                if (filtros[key]) filtros_activos[key] = filtros[key];
            }

            const resultados = await obtener_historial_compras(filtros_activos);
            definir_historial(resultados);
        } catch (error) {
            alert("Error al buscar compras.");
        } finally {
            definir_cargando(false);
        }
    };

    // Manejador de inputs del formulario
    const manejar_cambio_filtro = (e) => {
        definir_filtros({ ...filtros, [e.target.name]: e.target.value });
    };

    // Limpiar filtros y recargar tabla original
    const limpiar_filtros = async () => {
        const filtros_limpios = { fecha_inicio: '', fecha_fin: '', proveedor_id: '', compra_id: '' };
        definir_filtros(filtros_limpios);
        
        definir_cargando(true);
        const data = await obtener_historial_compras(); // Sin filtros
        definir_historial(data);
        definir_cargando(false);
    };

    if (cargando_auth) return <p className="text-gray-600">Verificando sesión...</p>;
    if (cargando && !historial.length) return <p className="text-gray-600">Cargando historial de compras...</p>;
    if (error_carga) return <p className="text-red-600">{error_carga}</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Historial de Compras</h1>

            {/* --- BARRA DE BÚSQUEDA --- */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <form onSubmit={manejar_busqueda} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    
                    {/* Filtro ID Compra */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Folio Compra</label>
                        <input 
                            type="number" name="compra_id" 
                            value={filtros.compra_id} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black" placeholder="#"
                        />
                    </div>

                    {/* Filtro Proveedor */}
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
                        <select 
                            name="proveedor_id" 
                            value={filtros.proveedor_id} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black bg-white"
                        >
                            <option value="">-- Todos --</option>
                            {listaProveedores.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Fecha Inicio */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                        <input 
                            type="date" name="fecha_inicio" 
                            value={filtros.fecha_inicio} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black" 
                        />
                    </div>
                    {/* Filtro Fecha Fin */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                        <input 
                            type="date" name="fecha_fin" 
                            value={filtros.fecha_fin} onChange={manejar_cambio_filtro}
                            className="w-full p-2 border rounded text-sm text-black" 
                        />
                    </div>

                    {/* Botones de Acción */}
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

            {/* --- TABLA DE RESULTADOS --- */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Compra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {historial.length > 0 ? (
                            historial.map((compra) => (
                                <tr key={compra.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{compra.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{compra.fecha}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{compra.proveedor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">${compra.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Link href={`/panel_control/compras/historial/${compra.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            Ver Detalles
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay compras registradas con estos criterios.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}