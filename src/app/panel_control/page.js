'use client';

import React from 'react';
import { useAuth } from '@/contexto/auth_contexto';
import { 
    obtener_dashboard_analytics,
    obtener_prediccion_tendencia,
    obtener_top_clientes,
    obtener_auditoria_precios,
    obtener_alerta_stock_analytics
} from '@/servicios/api_servicio';

// Importar componentes de analytics
import TarjetasKpi from './componentes/tarjetas_kpi';
import GraficaTendenciaVentas from './componentes/grafica_tendencia_ventas';
import GraficaTopClientes from './componentes/grafica_top_clientes';
import TablaAuditoriaPrecios from './componentes/tabla_auditoria_precios';
import AlertasStock from './componentes/alertas_stock';

export default function PanelPrincipal() {
    const { usuario_actual, cerrar_sesion, esta_autenticado } = useAuth();

    // Estados para analytics
    const [dashboard_analytics, definir_dashboard_analytics] = React.useState(null);
    const [prediccion_tendencia, definir_prediccion_tendencia] = React.useState(null);
    const [top_clientes, definir_top_clientes] = React.useState(null);
    const [auditoria_precios, definir_auditoria_precios] = React.useState(null);
    const [alerta_stock, definir_alerta_stock] = React.useState(null);
    const [cargando_analytics, definir_cargando_analytics] = React.useState(true);
    const [error_analytics, definir_error_analytics] = React.useState(null);

    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_analytics = async () => {
                try {
                    definir_cargando_analytics(true);
                    definir_error_analytics(null);

                    // Cargar todos los analytics en paralelo
                    const [dashboard, tendencia, clientes, auditoria, stock] = await Promise.all([
                        obtener_dashboard_analytics(),
                        obtener_prediccion_tendencia(),
                        obtener_top_clientes(5),
                        obtener_auditoria_precios(),
                        obtener_alerta_stock_analytics(10)
                    ]);

                    definir_dashboard_analytics(dashboard);
                    definir_prediccion_tendencia(tendencia);
                    definir_top_clientes(clientes);
                    definir_auditoria_precios(auditoria);
                    definir_alerta_stock(stock);

                } catch (error) {
                    console.error('Error al cargar analytics:', error);
                    definir_error_analytics('No se pudieron cargar los datos de analytics. Asegúrate de que el backend esté corriendo.');
                } finally {
                    definir_cargando_analytics(false);
                }
            };

            cargar_analytics();
        }
    }, [esta_autenticado]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm mb-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📊 Panel de Control - Analytics ML</h1>
                        {usuario_actual && (
                            <p className="text-gray-600 mt-1">Bienvenido, {usuario_actual.nombre || usuario_actual.email}</p>
                        )}
                    </div>
                    <button
                        onClick={cerrar_sesion}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="px-6 pb-6">
                {cargando_analytics ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando analytics con Machine Learning...</p>
                        </div>
                    </div>
                ) : error_analytics ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-red-800 font-bold mb-2">⚠️ Error al cargar analytics</h3>
                        <p className="text-red-600">{error_analytics}</p>
                        <p className="text-sm text-red-500 mt-2">
                            Verifica que el backend esté corriendo en http://localhost:3001
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* KPIs */}
                        <TarjetasKpi datos_ventas={dashboard_analytics?.ventas} />

                        {/* Gráfica de Tendencia de Ventas */}
                        <GraficaTendenciaVentas datos_prediccion={prediccion_tendencia} />

                        {/* Grid de 2 columnas: Top Clientes y Alertas de Stock */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GraficaTopClientes datos_clientes={top_clientes} />
                            <AlertasStock datos_stock={alerta_stock} />
                        </div>

                        {/* Auditoría de Precios */}
                        <TablaAuditoriaPrecios datos_auditoria={auditoria_precios} />

                        {/* Información del modelo */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-blue-800 font-semibold mb-2">ℹ️ Acerca de los Modelos de Machine Learning</h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>• <strong>Predicción de Tendencia:</strong> Regresión Lineal Simple para predecir ventas futuras</p>
                                <p>• <strong>Auditoría de Precios:</strong> Regresión Lineal Multivariada para detectar anomalías</p>
                                <p>• <strong>Top Clientes:</strong> Análisis SQL de clientes con mayor gasto</p>
                                <p>• <strong>Alertas de Stock:</strong> Detección inteligente de productos con inventario bajo</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}