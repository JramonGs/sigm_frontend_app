'use client'; // Necesario para usar hooks como useAuth y useRouter.

import React from 'react'; // React.
import { useRouter } from 'next/navigation'; // Importacion de navegacion.
import Link from 'next/link'; // Componente de navegación de Next.js
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import Image from 'next/image'; // Importacion para imagenes.

export default function PanelControlLayout({ children }) {
  const { usuario_actual,esta_autenticado, cargando_auth } = useAuth(); // Obtén el estado de autenticación.
  const router = useRouter(); // Hook de navegacion.
  const es_gerente = usuario_actual?.rol === 'Gerente'; // Verifica si es Gerente

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
        <aside className="w-64 bg-gray-800 text-white p-6 shrink-0 border-r border-gray-700">

          <div className="flex items-center justify-center mb-8 pb-4 border-b border-slate-700 space-x-2">
            <Image src="/logoblanco.png" alt="Logo SIGM" width={40} height={40} /> 
          <h2 className="text-2xl font-bold mb-6 text-center">SIGM Menú</h2>
          </div>

          <nav>
            <ul>
              <li className="mb-2"><Link href="/panel_control" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Panel Principal</Link></li>
              <li className="mb-2"><Link href="/panel_control/inventario" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Inventario</Link></li>
              <li className="mb-2"><Link href="/panel_control/ventas/registrar" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Registrar Venta</Link></li>
              <li className="mb-2"><Link href="/panel_control/clientes" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Clientes</Link></li>
              <li className="mb-2"><Link href="/panel_control/ventas/historial" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Historial Ventas</Link></li>
              <li className="mb-2"><Link href="/panel_control/proveedores" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Proveedores</Link></li>
              <li className="mb-2"><Link href="/panel_control/compras/registrar" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Registrar Compra</Link></li>
              <li className="mb-2"><Link href="/panel_control/compras/historial" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Historial Compras</Link></li>
              <li className="mb-2"><Link href="/panel_control/reportes" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">Reportes</Link></li>

              {es_gerente && (
                  <li className="mb-2">
                      <Link href="/panel_control/usuarios" className="block py-2 px-4 rounded hover:bg-gray-700 transition duration-200">
                          Gestión Usuarios
                      </Link>
                  </li>
              )}
              {/* Futuros enlaces en esta seccion.. */}
            </ul>
          </nav>
        </aside>

        {/* Contenido Principal. */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {children} 
        </main>
      </div>
    );
  }

  // Si no está autenticado (y ya no está cargando), no muestra nada.
  // (porque ya habrá sido redirigido por el useEffect).
  return null; 
}