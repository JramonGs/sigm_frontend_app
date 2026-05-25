'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GraficaTopClientes({ datos_clientes }) {
    if (!datos_clientes || !datos_clientes.clientes || datos_clientes.clientes.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Clientes</h2>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No hay datos de clientes disponibles</p>
                </div>
            </div>
        );
    }

    // Colores para las barras
    const colores = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    // Preparar datos para la gráfica
    const datos_grafica = datos_clientes.clientes.map((cliente, index) => ({
        nombre: cliente.nombre.length > 20 ? cliente.nombre.substring(0, 20) + '...' : cliente.nombre,
        nombre_completo: cliente.nombre,
        total: parseFloat(cliente.estadisticas.total_gastado),
        compras: cliente.estadisticas.total_compras,
        promedio: parseFloat(cliente.estadisticas.promedio_por_compra),
        ranking: cliente.ranking
    }));

    const TooltipPersonalizado = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
                    <p className="font-bold text-gray-800 mb-2">🏆 #{data.ranking} - {data.nombre_completo}</p>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                            Total Gastado: <span className="font-bold text-green-600">
                                ${data.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </p>
                        <p className="text-gray-600">
                            Compras: <span className="font-semibold">{data.compras}</span>
                        </p>
                        <p className="text-gray-600">
                            Promedio: <span className="font-semibold">
                                ${data.promedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">🏆 Top {datos_clientes.total_clientes} Clientes</h2>
                <p className="text-sm text-gray-600 mt-1">Clientes que más han gastado</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                    data={datos_grafica} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                    />
                    <YAxis 
                        type="category"
                        dataKey="nombre" 
                        tick={{ fontSize: 11 }}
                        width={90}
                    />
                    <Tooltip content={<TooltipPersonalizado />} />
                    <Bar 
                        dataKey="total" 
                        radius={[0, 8, 8, 0]}
                    >
                        {datos_grafica.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Resumen rápido */}
            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Clientes Analizados:</span>
                    <span className="font-bold text-gray-800">{datos_clientes.total_clientes}</span>
                </div>
            </div>
        </div>
    );
}
