import Link from 'next/link'; // Importacion de navegacion.
import Image from 'next/image'; // Opcional, si quieres añadir un logo

export default function PaginaBienvenida() {
  return (
    <main className="relative flex items-center justify-center min-h-screen">

      {/* Fondo de pantalla */}
      <Image 
      src="/fondoo.jpg"
      alt="Fondo de paisaje de montaña"
      layout="fill"
      objectFit="cover"
      quality={85}
      className="z-0"/>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>


      <div className="relative w-full max-w-md p-10 space-y-8 bg-white rounded-xl shadow-2xl z-20">
        
        {/* Encabezado del Proyecto */}
        <div className="text-center space-y-3">
          {/* Logo */}
          {<Image src="/logo.png" alt="Logo SIGM" width={180} height={180} className="mx-auto"/>}
          
          <h1 className="text-4xl font-extrabold text-blue-700">
            Bienvenido a SIGM
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema Integral de Gestión para Microempresas
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-4 pt-4">
          <Link
            href="/iniciar_sesion"
            className="w-full px-6 py-3 font-bold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            Iniciar Sesión
          </Link>

          <Link
            href="/registro"
            className="w-full px-6 py-3 font-semibold text-center text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
          >
            Registrar Nueva Cuenta
          </Link>
        </div>
        
      </div>
    </main>
  );
}