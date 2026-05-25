'use client';

export default function AlertasStock({ datos_stock }) {
    if (!datos_stock || !datos_stock.productos || datos_stock.productos.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">⚠️ Alertas de Stock</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-green-800 font-semibold">✅ Sin alertas de stock</p>
                    <p className="text-sm text-green-600 mt-1">Todos los productos tienen inventario suficiente</p>
                </div>
            </div>
        );
    }

    // Función para obtener el color según el nivel de alerta
    const obtener_color_alerta = (nivel) => {
        switch (nivel) {
            case 'CRÍTICO - SIN STOCK':
                return {
                    bg: 'bg-red-100',
                    border: 'border-red-300',
                    text: 'text-red-800',
                    badge: 'bg-red-600',
                    icon: '🔴'
                };
            case 'URGENTE':
                return {
                    bg: 'bg-orange-100',
                    border: 'border-orange-300',
                    text: 'text-orange-800',
                    badge: 'bg-orange-600',
                    icon: '🟠'
                };
            default: // ADVERTENCIA
                return {
                    bg: 'bg-yellow-100',
                    border: 'border-yellow-300',
                    text: 'text-yellow-800',
                    badge: 'bg-yellow-600',
                    icon: '🟡'
                };
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">⚠️ Alertas de Stock</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Umbral: {datos_stock.umbral} unidades | Productos afectados: {datos_stock.total_productos_afectados}
                </p>
            </div>

            {/* Resumen por nivel */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-600 font-medium">Crítico</p>
                            <p className="text-2xl font-bold text-red-800">{datos_stock.resumen?.critico || 0}</p>
                        </div>
                        <div className="text-2xl">🔴</div>
                    </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-600 font-medium">Urgente</p>
                            <p className="text-2xl font-bold text-orange-800">{datos_stock.resumen?.urgente || 0}</p>
                        </div>
                        <div className="text-2xl">🟠</div>
                    </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-yellow-600 font-medium">Advertencia</p>
                            <p className="text-2xl font-bold text-yellow-800">{datos_stock.resumen?.advertencia || 0}</p>
                        </div>
                        <div className="text-2xl">🟡</div>
                    </div>
                </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {datos_stock.productos.map((producto, index) => {
                    const colores = obtener_color_alerta(producto.nivel_alerta);
                    return (
                        <div 
                            key={index} 
                            className={`${colores.bg} border ${colores.border} rounded-lg p-4`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{colores.icon}</span>
                                        <h3 className={`font-semibold ${colores.text}`}>
                                            {producto.nombre}
                                        </h3>
                                    </div>
                                    <div className="flex gap-4 text-sm mt-2">
                                        <div>
                                            <span className="text-gray-600">Inventario: </span>
                                            <span className={`font-bold ${colores.text}`}>
                                                {producto.inventario} unidades
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Precio: </span>
                                            <span className="font-semibold text-gray-800">
                                                ${parseFloat(producto.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    {producto.accion_sugerida && (
                                        <p className="text-xs text-gray-700 mt-2 italic">
                                            💡 {producto.accion_sugerida}
                                        </p>
                                    )}
                                </div>
                                <span className={`${colores.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                                    {producto.nivel_alerta}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
