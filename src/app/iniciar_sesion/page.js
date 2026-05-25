// --- PASO 1: Indicar que es un Componente de Cliente ---
// Necesitamos que sea un "Componente de Cliente" porque va a interactuar con el usuario (manejar estado, formularios).
'use client'; 

// --- PASO 2: Importar Herramientas ---
import React from 'react'; // Para manejar el estado del formulario.
import instancia_api from '@/servicios/api_servicio'; // Para llamar a la API.
import { useAuth } from '@/contexto/auth_contexto'; // Contexto de autenticación.
import Link from 'next/link'; // Importacion de navegacion.
import Image from 'next/image'; // Importacion para el fondo.

// --- PASO 3: Definir el Componente de la Página ---
export default function IniciarSesion() {

  // --- PASO 4: Definir el Estado ---
  // Creamos estados para guardar lo que el usuario escribe.
  const [email, definir_email] = React.useState(''); // Limpiamos el email.
  const [contrasena, definir_contrasena] = React.useState(''); // Limpiamos la contraseña.
  const [error, definir_error] = React.useState(null); // Para mostrar mensajes de error.
  const [cargando, definir_cargando] = React.useState(false); // Estado de carga.
  const { iniciar_sesion } = useAuth(); // Usar el contexto de autenticación.

  // --- PASO 5: Crear la Función de Envío ---
const manejar_submit = async (evento) => {
    evento.preventDefault(); // Evita que la página se recargue.
    definir_cargando(true); 
    definir_error(null); // Limpia errores anteriores.

    try {
      // Llamamos a la API de back-end usando la instancia configurada en api_servicio.js
    const respuesta = await instancia_api.post('/login', {
        email: email,
        contrasena: contrasena
    });

      // ¡ÉXITO!
      console.log('¡Login exitoso!', respuesta.data); // Respuesta.
    
      if (respuesta.data.token) { // Verificacion simple.
        
        // Actualizamos el contexto de autenticación
        iniciar_sesion(respuesta.data.token);
    } else {
        // Esto no debería pasar si el login fue exitoso, pero es bueno verificar
        definir_error('No se recibió el token del servidor.');  
    }

    } catch (error_axios) { // Error
      console.error('Error en el login:', error_axios); // log del error.
    
      if (error_axios.response && error_axios.response.status === 401) { // Validacion del error.
        definir_error('Credenciales inválidas. Por favor, intenta de nuevo.'); // Respuesta.
    } else if (!error_axios.response) {
        // Error de conexión - probablemente cold start de Render Free
        definir_error('No se pudo conectar con el servidor. Si es la primera vez, el servidor puede tardar ~30 segundos en iniciar. Por favor, intenta de nuevo.');
    } else {
        definir_error('Ocurrió un error. Por favor, intenta más tarde.'); // Respuesta.
    }
    } finally {
      definir_cargando(false); // Termina el estado de carga
    }
};

  // --- PASO 6: Renderizar el Formulario (HTML/JSX) ---
  // Usamos clases de Tailwind CSS para el estilo
return (
    <main className="relative flex items-center justify-center min-h-screen">
    
      {/* Fondo de pantalla */}
    <Image
        src="/fondoo.jpg"
        alt="Fondo de paisaje de montañana"
        fill
        style={{ objectFit: 'cover'}}
        quality={85}
        className="z-0"
        priority={false}
    />

      {/* Overlay oscuro */}
    <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

    <div className="relative w-full max-w-sm p-10 bg-white rounded-xl shadow-2xl z-20">
        <form onSubmit={manejar_submit} className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-blue-700">
            Iniciar Sesión (SIGM)
        </h2>

          {/* Mostrar mensaje de error si existe. */}
        {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300">
            {error}
            </div>
        )}

          {/* Campo de Email */}
        <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
            Correo electronico
            </label>
            <input 
            type="email"
            id="email"
            value={email}
            onChange={(e) => definir_email(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
            />
        </div>

          {/* Campo de contraseña */}
        <div className="mb-8">
            <label htmlFor="contrasena" className="block mb-2 text-sm font-medium text-gray-700">
            Contraseña
            </label>
            <input
            type="password"
            id="contrasena"
            value={contrasena}
            onChange={(e) => definir_contrasena(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400" 
            />
        </div>

          {/* Boton de envio */}
        <button 
            type="submit" 
            disabled={cargando} // Añadido para deshabilitar el botón mientras carga
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-white transition duration-150 ease-in-out disabled:opacity-50"
        >
            {cargando ? 'Ingres ando...' : 'Ingresar'}
        </button>
        </form>
        
        <div className="mt-6 text-sm text-center text-gray-600 space-y-2">
        <p>
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
            Registra aqui
            </Link>
        </p>
        <p>
            <Link href="/" className="font-medium text-gray-500 hover:text-gray-700">
            &larr; Volver al inicio.
            </Link>
        </p>
        </div>
        
    </div>
    </main>
);
}