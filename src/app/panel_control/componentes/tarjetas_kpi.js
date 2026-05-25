'use client';

export default function TarjetasKpi({ datos_ventas }) {
    if (!datos_ventas) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total de Ventas */}
            <div className="bg-blue-600 border-l-4 border-blue-800 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">Total de Ventas</p>
                        <p className="text-3xl font-bold mt-2">{datos_ventas.total_ventas || 0}</p>
                    </div>
                    <div className="text-4xl opacity-50">📊</div>
                </div>
            </div>

            {/* Total de Ingresos */}
            <div className="bg-green-600 border-l-4 border-green-800 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">Total de Ingresos</p>
                        <p className="text-3xl font-bold mt-2">${parseFloat(datos_ventas.total_ingresos || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-4xl opacity-50">💰</div>
                </div>
            </div>

            {/* Promedio por Venta */}
            <div className="bg-purple-600 border-l-4 border-purple-800 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">Promedio por Venta</p>
                        <p className="text-3xl font-bold mt-2">${parseFloat(datos_ventas.promedio_venta || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-4xl opacity-50">📈</div>
                </div>
            </div>

            {/* Última Venta */}
            <div className="bg-orange-600 border-l-4 border-orange-800 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">Última Venta</p>
                        <p className="text-xl font-bold mt-2">
                            {datos_ventas.ultima_venta 
                                ? new Date(datos_ventas.ultima_venta).toLocaleDateString('es-MX', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })
                                : 'Sin ventas'}
                        </p>
                    </div>
                    <div className="text-4xl opacity-50">🕒</div>
                </div>
            </div>
        </div>
    );
}
