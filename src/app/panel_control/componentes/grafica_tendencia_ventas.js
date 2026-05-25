'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GraficaTendenciaVentas({ datos_prediccion }) {
    if (!datos_prediccion || !datos_prediccion.datos_historicos) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Tendencia de Ventas</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>Cargando predicción...</p>
                </div>
            </div>
        );
    }

    // Preparar datos para la gráfica
    const datos_grafica = datos_prediccion.datos_historicos.map(item => ({
        dia: `Día ${item.dia}`,
        fecha: new Date(item.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
        total: parseFloat(item.total),
        nombre: new Date(item.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
    }));

    // Agregar predicción como último punto
    if (datos_prediccion.prediccion) {
        datos_grafica.push({
            dia: `Día ${datos_prediccion.prediccion.dia_siguiente}`,
            fecha: 'Predicción',
            total: parseFloat(datos_prediccion.prediccion.total_estimado),
            nombre: 'Predicción',
            es_prediccion: true
        });
    }

    const TooltipPersonalizado = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold text-gray-800">{data.nombre}</p>
                    <p className="text-sm text-gray-600">
                        Total: <span className="font-bold text-blue-600">
                            ${parseFloat(data.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                    </p>
                    {data.es_prediccion && (
                        <p className="text-xs text-orange-600 mt-1">⚡ Estimado</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">📈 Tendencia de Ventas - Predicción ML</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Modelo: {datos_prediccion.modelo} | R² = {datos_prediccion.estadisticas?.r2 || 'N/A'}
                </p>
                {datos_prediccion.prediccion?.interpretacion && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                        💡 {datos_prediccion.prediccion.interpretacion}
                    </p>
                )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datos_grafica} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="fecha" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString('es-MX')}`}
                    />
                    <Tooltip content={<TooltipPersonalizado />} />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total de Ventas"
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Estadísticas del modelo */}
            <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                <div className="text-center">
                    <p className="text-xs text-gray-500">Pendiente</p>
                    <p className="text-sm font-bold text-gray-800">
                        {datos_prediccion.estadisticas?.pendiente?.toFixed(2) || 'N/A'}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Días Analizados</p>
                    <p className="text-sm font-bold text-gray-800">
                        {datos_prediccion.estadisticas?.dias_analizados || 'N/A'}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Predicción Siguiente</p>
                    <p className="text-sm font-bold text-green-600">
                        ${parseFloat(datos_prediccion.prediccion?.total_estimado || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
