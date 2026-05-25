// Marcar como componente de cliente para usar hooks
'use client';

import React from 'react'; // Importaciones para usar estados.
import { useParams } from 'next/navigation'; // Hook para obtener parámetros de la URL
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_detalle_compra } from '@/servicios/api_servicio'; // La función que agregamos al servicio
import Link from 'next/link'; // Para el botón de volver

export default function PaginaDetalleCompra() {
    const { esta_autenticado } = useAuth();
    const params = useParams(); // Obtiene los parámetros de la URL
    const id_compra = params.id; // Extrae el ID de la compra

    const [compra, definir_compra] = React.useState(null); // Estado para guardar los detalles
    const [cargando, definir_cargando] = React.useState(true); // Estado de carga. 
    const [error_carga, definir_error_carga] = React.useState(null); // Estado de error de carga.

    // Efecto para cargar los detalles de la compra cuando el componente se monta o el ID cambia
    React.useEffect(() => {
        if (esta_autenticado && id_compra) {
            const cargar_detalles = async () => {
                try {
                    definir_cargando(true);
                    const datos_compra = await obtener_detalle_compra(id_compra);
                    definir_compra(datos_compra);
                    definir_error_carga(null);
                } catch (error) {
                    console.error(`Error al cargar detalles de la compra ${id_compra}:`, error);
                    if (error.response?.status === 404) {
                        definir_error_carga("Compra no encontrada.");
                    } else {
                        definir_error_carga("No se pudieron cargar los detalles de la compra.");
                    }
                } finally {
                    definir_cargando(false);
                }
            };
            cargar_detalles();
        }
    }, [esta_autenticado, id_compra]); // Dependencias del efecto

    // Renderizado condicional
    if (cargando) return <p className="text-gray-600">Cargando detalles de la compra...</p>;
    if (error_carga) return <p className="text-red-600">{error_carga}</p>;
    if (!compra) return <p className="text-gray-500">No se encontraron datos de la compra.</p>; // Por si acaso

    // Renderizado principal
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Detalles de Compra #{compra.id}</h1>
                <Link href="/panel_control/compras/historial" className="text-blue-600 hover:text-blue-800 text-sm">
                    &larr; Volver al Historial
                </Link>
            </div>

            {/* --- Información General de la Compra --- */}
            <div className="mb-6 p-4 bg-white rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="font-medium text-gray-600">Fecha y Hora:</span>
                    <p className="text-gray-800">{compra.fecha}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Proveedor:</span>
                    <p className="text-gray-800">{compra.proveedor}</p>
                </div>
                <div>
                    <span className="font-medium text-gray-600">Total Compra:</span>
                    <p className="text-gray-800 font-semibold text-lg">${compra.total}</p>
                </div>
            </div>

            {/* --- Tabla de Productos Comprados --- */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <h2 className="text-xl font-semibold p-4 text-gray-700 border-b">Productos Comprados</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto (ID)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {compra.detalles && compra.detalles.length > 0 ? (
                            compra.detalles.map((detalle, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {detalle.nombre_producto} ({detalle.producto_id})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{detalle.cantidad}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${detalle.costo_unitario}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">${detalle.subtotal}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No hay detalles de productos para esta compra.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
