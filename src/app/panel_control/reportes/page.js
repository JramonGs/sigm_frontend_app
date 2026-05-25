// Marca como Componente de Cliente
'use client';

import React from 'react'; // Importamos React.
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_ventas_filtradas, obtener_compras_filtradas } from '@/servicios/api_servicio'; // Importamos las funciones de API.
import jsPDF from 'jspdf'; // Importaciones para manejar PDF.
import autoTable from 'jspdf-autotable'; // Funcion para tablas.
import * as XLSX from 'xlsx'; 

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const obtenerFechaHoy = () => {
    const hoy = new Date(); // Obtiene la fecha actual.
    return hoy.toISOString().split('T')[0]; // Formatea la fecha.
};

export default function PaginaReportes() {
    const { esta_autenticado, cargando_auth } = useAuth(); // Hook de autenticacion.

    // --- Estados para los Filtros ---
    const [tipo_reporte, definir_tipo_reporte] = React.useState('ventas'); // 'ventas' o 'compras'
    const [fecha_inicio, definir_fecha_inicio] = React.useState(obtenerFechaHoy()); // Fecha de inicio.
    const [fecha_fin, definir_fecha_fin] = React.useState(obtenerFechaHoy()); // Fecha de fin.

    // --- Estados para los Datos ---
    const [resultados, definir_resultados] = React.useState([]); // Resultados del reporte.
    const [cargando_reporte, definir_cargando_reporte] = React.useState(false); // Estado de carga del reporte.
    const [error_reporte, definir_error_reporte] = React.useState(null); // Estado de error del reporte.
    // Estado para saber qué reporte se está mostrando (y poder cambiar la cabecera de la tabla)
    const [reporte_mostrado, definir_reporte_mostrado] = React.useState(null); // Estado del reporte mostrado.

    // --- Guardia de Autenticación ---
    if (cargando_auth) {
        return <p className="text-gray-600">Verificando sesión...</p>;
    }
    if (!esta_autenticado) {
        return <p className="text-red-600">Acceso denegado.</p>;
    }

    // --- Función para Generar el Reporte ---
    const manejar_generar_reporte = async () => {
        definir_error_reporte(null);
        definir_cargando_reporte(true);
        definir_resultados([]); // Limpia resultados anteriores

        try {
            let datos;
            if (tipo_reporte === 'ventas') {
                datos = await obtener_ventas_filtradas(fecha_inicio, fecha_fin);
                definir_reporte_mostrado('ventas');
            } else if (tipo_reporte === 'compras') {
                datos = await obtener_compras_filtradas(fecha_inicio, fecha_fin);
                definir_reporte_mostrado('compras');
            }
            definir_resultados(datos);
        } catch (error) {
            console.error(`Error al generar reporte de ${tipo_reporte}:`, error);
            definir_error_reporte(error.response?.data?.error || `No se pudo cargar el reporte de ${tipo_reporte}.`);
        } finally {
            definir_cargando_reporte(false);
        }
    };

    // Funcion para generar PDF.
    const exportarPDF = () => {
        const doc = new jsPDF();
        
        // Título del PDF
        const titulo = `Reporte de ${reporte_mostrado === 'ventas' ? 'Ventas' : 'Compras'}`;
        doc.text(titulo, 14, 22);
        doc.setFontSize(11);
        doc.text(`Del: ${fecha_inicio}  Al: ${fecha_fin}`, 14, 30);

        // Definir columnas y filas según el tipo de reporte
        let columnas = [];
        let filas = [];

        if (reporte_mostrado === 'ventas') {
            columnas = ["ID", "Fecha", "Cliente", "Total"];
            filas = resultados.map(item => [item.id, item.fecha, item.cliente, `$${item.total}`]);
        } else {
            columnas = ["ID", "Fecha", "Proveedor", "Total"];
            filas = resultados.map(item => [item.id, item.fecha, item.proveedor, `$${item.total}`]);
        }

        // Generar tabla
        autoTable(doc,{
            startY: 40,
            head: [columnas],
            body: filas,
        });

        // Guardar archivo
        doc.save(`reporte_${reporte_mostrado}_${fecha_inicio}.pdf`);
    };

    // Funcion para generar hoja de Excel.
    const exportarExcel = () => {
        // Crear hoja de trabajo (Worksheet) desde el JSON
        const hoja = XLSX.utils.json_to_sheet(resultados);
        
        // Crear libro de trabajo (Workbook)
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Reporte");

        // Guardar archivo
        XLSX.writeFile(libro, `reporte_${reporte_mostrado}_${fecha_inicio}.xlsx`);
    };

    // --- Función para renderizar la tabla de resultados ---
    const renderizarTablaResultados = () => {
        if (cargando_reporte) {
            return <p className="text-gray-600">Generando reporte...</p>;
        }

        if (error_reporte) {
            return <p className="text-red-600">{error_reporte}</p>;
        }

        if (resultados.length === 0 && reporte_mostrado) {
            return <p className="text-gray-500">No se encontraron resultados para el rango de fechas seleccionado.</p>;
        }

        if (resultados.length === 0) {
            return null; // No muestra nada si aún no se genera un reporte
        }

        // --- Tabla de Ventas ---
        if (reporte_mostrado === 'ventas') {
            return (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Venta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {resultados.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{item.id}</td>
                                <td className="px-6 py-4">{item.fecha}</td>
                                <td className="px-6 py-4">{item.cliente}</td>
                                <td className="px-6 py-4 text-right font-semibold">${item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        // --- Tabla de Compras ---
        if (reporte_mostrado === 'compras') {
            return (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Compra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                        {resultados.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">{item.id}</td>
                                <td className="px-6 py-4">{item.fecha}</td>
                                <td className="px-6 py-4">{item.proveedor}</td>
                                <td className="px-6 py-4 text-right font-semibold">${item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Generador de Reportes</h1>

            {/* --- Sección de Filtros --- */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Seleccionar Filtros</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    {/* Tipo de Reporte */}
                    <div className="md:col-span-1">
                        <label htmlFor="tipo_reporte" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                        <select
                            id="tipo_reporte"
                            value={tipo_reporte}
                            onChange={(e) => definir_tipo_reporte(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                        >
                            <option value="ventas">Ventas</option>
                            <option value="compras">Compras</option>
                        </select>
                    </div>

                    {/* Fecha Inicio */}
                    <div className="md:col-span-1">
                        <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            id="fecha_inicio"
                            value={fecha_inicio}
                            onChange={(e) => definir_fecha_inicio(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>

                    {/* Fecha Fin */}
                    <div className="md:col-span-1">
                        <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                        <input
                            type="date"
                            id="fecha_fin"
                            value={fecha_fin}
                            onChange={(e) => definir_fecha_fin(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    
                    {/* Botón Generar */}
                    <div className="flex items-end md:col-span-1">
                        <button
                            type="button"
                            onClick={manejar_generar_reporte}
                            disabled={cargando_reporte}
                            className={`w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${cargando_reporte ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                        >
                            {cargando_reporte ? 'Generando...' : 'Generar Reporte'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Botones para generacion de PDF y Excel. */}
            {resultados.length > 0 && (
                <div className="flex gap-4 mb-4 justify-end">
                    <button 
                        onClick={exportarPDF}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                        <span>📄 Exportar PDF</span>
                    </button>
                    <button 
                        onClick={exportarExcel}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                        <span>📊 Exportar Excel</span>
                    </button>
                </div>
            )}

            {/* --- Sección de Resultados --- */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {renderizarTablaResultados()}
            </div>
        </div>
    );
}