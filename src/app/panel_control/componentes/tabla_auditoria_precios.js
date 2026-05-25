'use client';

export default function TablaAuditoriaPrecios({ datos_auditoria }) {
    if (!datos_auditoria || !datos_auditoria.dataset || datos_auditoria.dataset.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Auditoría de Precios</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No hay datos de auditoría disponibles</p>
                </div>
            </div>
        );
    }

    // Filtrar solo las anomalías para mostrar
    const anomalias = datos_auditoria.dataset.filter(item => item.es_anomalia);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">🔍 Auditoría de Precios - Detección de Anomalías</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Modelo: {datos_auditoria.modelo} | R² = {datos_auditoria.estadisticas?.r2 || 'N/A'}
                </p>
            </div>

            {/* Estadísticas Generales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">Ventas Analizadas</p>
                    <p className="text-2xl font-bold text-blue-800">{datos_auditoria.estadisticas?.ventas_analizadas || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">Anomalías Detectadas</p>
                    <p className="text-2xl font-bold text-red-800">{datos_auditoria.estadisticas?.anomalias_detectadas || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-xs text-orange-600 font-medium">% Anomalías</p>
                    <p className="text-2xl font-bold text-orange-800">{datos_auditoria.estadisticas?.porcentaje_anomalias || 0}%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">Precisión (R²)</p>
                    <p className="text-2xl font-bold text-green-800">{datos_auditoria.estadisticas?.r2 || 'N/A'}</p>
                </div>
            </div>

            {/* Tabla de Anomalías */}
            {anomalias.length > 0 ? (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">⚠️ Anomalías Detectadas ({anomalias.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venta ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Real</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Esperado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Diff</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {anomalias.slice(0, 10).map((item, index) => (
                                    <tr key={index} className="hover:bg-red-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{item.venta_id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.total_items}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{item.productos_unicos}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${parseFloat(item.total_real).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            ${parseFloat(item.total_esperado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600">
                                            ${parseFloat(item.diferencia).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                                                {parseFloat(item.porcentaje_diferencia).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {anomalias.length > 10 && (
                        <p className="text-sm text-gray-500 mt-3">
                            Mostrando 10 de {anomalias.length} anomalías detectadas
                        </p>
                    )}
                </div>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-green-800 font-semibold">✅ No se detectaron anomalías</p>
                    <p className="text-sm text-green-600 mt-1">Todas las ventas están dentro del rango esperado</p>
                </div>
            )}
        </div>
    );
}
