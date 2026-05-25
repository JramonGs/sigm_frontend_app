'use client'; // Necesario para usar hooks como useAuth y useRouter.

import React from 'react'; // React.
import { useRouter, usePathname } from 'next/navigation'; // Importacion de navegacion.
import Link from 'next/link'; // Componente de navegación de Next.js
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import Image from 'next/image'; // Importacion para imagenes.

export default function PanelControlLayout({ children }) {
  const { usuario_actual,esta_autenticado, cargando_auth } = useAuth(); // Obtén el estado de autenticación.
  const router = useRouter(); // Hook de navegacion.
  const pathname = usePathname(); // Obtener la ruta actual
  const es_gerente = usuario_actual?.rol === 'Gerente'; // Verifica si es Gerente

  // Validar si el empleado intenta entrar a una ruta no permitida
  const es_ruta_permitida_empleado = pathname === '/panel_control' || pathname.startsWith('/panel_control/ventas');
  const acceso_denegado = usuario_actual?.rol === 'Empleado' && !es_ruta_permitida_empleado;

  React.useEffect(() => {
    // Si NO está cargando y NO está autenticado, redirige al login.
    if (!cargando_auth && !esta_autenticado) {
      router.push('/iniciar_sesion');
    }
  }, [esta_autenticado, cargando_auth, router]); // Dependencias del efecto.

  // Muestra un mensaje de carga mientras se verifica el token.
  if (cargando_auth) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p className="text-gray-600">Verificando autenticación...</p>
            {/* Futura mejora de spinner.*/}
        </div>
    );
  }

  // Si está autenticado, muestra el contenido de la página (children)
  // junto con la barra lateral.
  if (esta_autenticado) {
    return (
      <div className="flex min-h-screen">
        {/* Barra Lateral (Placeholder). */}
        <aside className="w-64 bg-slate-900 text-white p-6 shrink-0 border-r border-slate-800">

          <div className="flex items-center justify-center mb-8 pb-4 border-b border-slate-850 space-x-2">
            <Image src="/logoblanco.png" alt="Logo SIGM" width={40} height={40} /> 
            <h2 className="text-xl font-bold text-center tracking-wide text-slate-100">SIGM Menú</h2>
          </div>

          <nav>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/panel_control" 
                  className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                    pathname === '/panel_control' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Panel Principal
                </Link>
              </li>

              {es_gerente && (
                <li>
                  <Link 
                    href="/panel_control/inventario" 
                    className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                      pathname.startsWith('/panel_control/inventario') 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Inventario
                  </Link>
                </li>
              )}

              <li>
                <Link 
                  href="/panel_control/ventas/registrar" 
                  className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                    pathname === '/panel_control/ventas/registrar' 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Registrar Venta
                </Link>
              </li>

              {es_gerente && (
                <li>
                  <Link 
                    href="/panel_control/clientes" 
                    className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                      pathname.startsWith('/panel_control/clientes') 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Clientes
                  </Link>
                </li>
              )}

              <li>
                <Link 
                  href="/panel_control/ventas/historial" 
                  className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                    pathname.startsWith('/panel_control/ventas/historial') 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Historial Ventas
                </Link>
              </li>

              {es_gerente && (
                <>
                  <li>
                    <Link 
                      href="/panel_control/proveedores" 
                      className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                        pathname.startsWith('/panel_control/proveedores') 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Proveedores
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/panel_control/compras/registrar" 
                      className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                        pathname === '/panel_control/compras/registrar' 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Registrar Compra
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/panel_control/compras/historial" 
                      className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                        pathname.startsWith('/panel_control/compras/historial') 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Historial Compras
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/panel_control/reportes" 
                      className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                        pathname.startsWith('/panel_control/reportes') 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Reportes
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/panel_control/usuarios" 
                      className={`block py-2.5 px-4 rounded-lg font-medium transition-all duration-150 hover:bg-slate-800 ${
                        pathname.startsWith('/panel_control/usuarios') 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Gestión Usuarios
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        {/* Contenido Principal. */}
        <main key={pathname} className="flex-1 p-6 bg-slate-50 overflow-y-auto animate-fade-in animate-slide-up">
          {acceso_denegado ? (
            <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-xl border border-slate-100 text-center animate-scale-in">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Acceso Denegado</h1>
              <p className="text-slate-600 mb-6">
                No tienes permisos suficientes para acceder al módulo seleccionado.
              </p>
              <button 
                onClick={() => router.push('/panel_control')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200"
              >
                Volver al Panel Principal
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    );
  }

  // Si no está autenticado (y ya no está cargando), no muestra nada.
  // (porque ya habrá sido redirigido por el useEffect).
  return null; 
}