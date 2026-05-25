'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexto/auth_contexto';
import { 
    obtener_dashboard_analytics,
    obtener_top_clientes,
    obtener_alerta_stock_analytics,
    obtener_stats_empleado
} from '@/servicios/api_servicio';

// Importar componentes de analytics
import TarjetasKpi from './componentes/tarjetas_kpi';
import GraficaTopClientes from './componentes/grafica_top_clientes';
import AlertasStock from './componentes/alertas_stock';

export default function PanelPrincipal() {
    const { usuario_actual, cerrar_sesion, esta_autenticado } = useAuth();

    // Estados para analytics
    const [dashboard_analytics, definir_dashboard_analytics] = React.useState(null);
    const [top_clientes, definir_top_clientes] = React.useState(null);
    const [alerta_stock, definir_alerta_stock] = React.useState(null);
    const [stats_empleado, definir_stats_empleado] = React.useState(null);
    const [cargando_analytics, definir_cargando_analytics] = React.useState(true);
    const [error_analytics, definir_error_analytics] = React.useState(null);

    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_datos = async () => {
                try {
                    definir_cargando_analytics(true);
                    definir_error_analytics(null);

                    if (usuario_actual?.rol === 'Empleado') {
                        const stats = await obtener_stats_empleado();
                        definir_stats_empleado(stats);
                    } else {
                        // Cargar todos los analytics de Gerente en paralelo
                        const [dashboard, clientes, stock] = await Promise.all([
                            obtener_dashboard_analytics(),
                            obtener_top_clientes(5),
                            obtener_alerta_stock_analytics(10)
                        ]);

                        definir_dashboard_analytics(dashboard);
                        definir_top_clientes(clientes);
                        definir_alerta_stock(stock);
                    }

                } catch (error) {
                    console.error('Error al cargar datos del panel:', error);
                    definir_error_analytics('No se pudieron cargar los datos de analytics. Asegúrate de que el backend esté corriendo.');
                } finally {
                    definir_cargando_analytics(false);
                }
            };

            cargar_datos();
        }
    }, [esta_autenticado, usuario_actual]);

    const render_dashboard_empleado = () => {
        if (!stats_empleado) return null;

        const fecha_formateada = new Date(stats_empleado.fecha_registro).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return (
            <div className="space-y-8 animate-fade-in">
                {/* Tarjeta de Bienvenida */}
                <div className="relative overflow-hidden bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg border border-blue-500/10">
                    <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md mb-3">
                                💼 Panel de Ventas
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight">
                                ¡Hola de nuevo, {stats_empleado.nombre_completo || usuario_actual?.email}!
                            </h2>
                            <p className="text-blue-100 mt-2 font-medium">
                                Miembro del equipo desde el {fecha_formateada}
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/panel_control/ventas/registrar"
                                className="inline-block px-5 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition duration-205"
                            >
                                ➕ Registrar Venta
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Ventas */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex items-center space-x-6">
                        <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2050/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ventas Totales Realizadas</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats_empleado.total_ventas}</h3>
                            <p className="text-xs text-slate-400 mt-1">Acumulado desde el registro</p>
                        </div>
                    </div>

                    {/* Ingresos Mes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 flex items-center space-x-6">
                        <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2050/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 21h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ingresos del Mes Actual</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">
                                ${stats_empleado.ingresos_mes_actual.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Ventas facturadas este mes</p>
                        </div>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Accesos Rápidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/panel_control/ventas/registrar"
                            className="group flex flex-col justify-between p-6 bg-slate-50 hover:bg-blue-50/45 border border-slate-150 hover:border-blue-200 rounded-xl transition duration-200 text-left"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2050/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition duration-150">Registrar Nueva Venta</h4>
                                <p className="text-slate-500 text-sm mt-1">Abre el módulo de punto de venta para facturar y procesar transacciones al instante.</p>
                            </div>
                            <div className="flex items-center text-blue-600 font-bold text-sm mt-6 group-hover:translate-x-1 transition duration-150">
                                Ir al punto de venta &rarr;
                            </div>
                        </Link>

                        <Link
                            href="/panel_control/ventas/historial"
                            className="group flex flex-col justify-between p-6 bg-slate-50 hover:bg-blue-50/45 border border-slate-150 hover:border-blue-200 rounded-xl transition duration-200 text-left"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                    </svg>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition duration-150">Ver Mi Historial de Ventas</h4>
                                <p className="text-slate-500 text-sm mt-1">Consulta y descarga los comprobantes de tus transacciones previas en PDF o Excel.</p>
                            </div>
                            <div className="flex items-center text-blue-600 font-bold text-sm mt-6 group-hover:translate-x-1 transition duration-150">
                                Ver historial &rarr;
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white shadow-sm mb-6 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">📊 Panel Principal</h1>
                    {usuario_actual && (
                        <p className="text-slate-500 mt-1">
                            Sesión iniciada como <strong className="text-slate-700">{usuario_actual.nombre_completo || usuario_actual.email}</strong> ({usuario_actual.rol})
                        </p>
                    )}
                </div>
                <button
                    onClick={cerrar_sesion}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* Contenido */}
            <div className="pb-6">
                {cargando_analytics ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-slate-500">Cargando datos...</p>
                        </div>
                    </div>
                ) : error_analytics ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <h3 className="text-red-800 font-bold mb-2">⚠️ Error al cargar panel</h3>
                        <p className="text-red-600">{error_analytics}</p>
                        <p className="text-sm text-red-500 mt-2">
                            Verifica que el backend esté corriendo en http://localhost:3001
                        </p>
                    </div>
                ) : usuario_actual?.rol === 'Empleado' ? (
                    render_dashboard_empleado()
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* KPIs Gerente */}
                        <TarjetasKpi datos_ventas={dashboard_analytics?.ventas} />

                        {/* Grid de 2 columnas: Top Clientes y Alertas de Stock */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GraficaTopClientes datos_clientes={top_clientes} />
                            <AlertasStock datos_stock={alerta_stock} />
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}