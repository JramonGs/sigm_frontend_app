// Define este componente como un Componente de Cliente
'use client'; 

import React from 'react'; // Importacion para manejar estados.
import { useRouter } from 'next/navigation'; // Importa el router para redirigir
import Link from 'next/link'; // Importacion de navegacion.
import axios from 'axios'; // Importa Axios para la petición HTTP
import Image from 'next/image'; // Importacion para imagenes. 

export default function PaginaRegistro() {
    // Estados para los campos del formulario
    const [email, setEmail] = React.useState(''); // Estado del correo.
    const [contrasena, setContrasena] = React.useState(''); // Estado de la contrasena.
    const [nombre_empresa, setNombreEmpresa] = React.useState(''); // Estado del nombre de la empresa.
    
    // Estados para manejar la retroalimentación del usuario
    const [error, setError] = React.useState(null); // Estado del error.
    const [exito, setExito] = React.useState(null); // Estado del exito.
    const [cargando, setCargando] = React.useState(false); // Estado de carga.

    const router = useRouter(); // Inicializa el router

    // Función que se ejecuta al enviar el formulario
    const manejar_registro = async (evento) => {
        evento.preventDefault(); // Evita que la página se recargue
        setCargando(true); // Inicia la carga.
        setError(null); // Limpiar errores previos.
        setExito(null); // Limpiar exitos previos.

        // Validacion simple
        if (!email || !contrasena || !nombre_empresa) {
            setError('Todos los campos son obligatorios.');
            setCargando(false); // Finaliza la carga.
            return;
        }

        try {
            // Llama al endpoint de la API que creaste
            const respuesta = await axios.post('http://localhost:3001/api/registro', {
                email: email,
                contrasena: contrasena,
                nombre_empresa: nombre_empresa
            });

            // Muestra mensaje de éxito
            setExito('¡Registro exitoso! Redirigiendo al inicio de sesión...');
            
            // Redirige al usuario a la página de inicio de sesión después de 2 segundos
            setTimeout(() => {
                router.push('/iniciar_sesion');
            }, 2000);

        } catch (error_api) {
            // Maneja errores de la API (ej. correo duplicado)
            if (error_api.response && error_api.response.data && error_api.response.data.error) {
                setError(error_api.response.data.error);
            } else {
                setError('Error al conectar con el servidor.');
            }
            setCargando(false); // Finaliza la carga.
        }
    };

    return (
        <main className="relative flex items-center justify-center min-h-screen">
            <Image
            src="/fondoo.jpg" // Asegúrate que la imagen está en /public
            alt="Fondo de paisaje de montaña"
            fill // Propiedad moderna
            style={{ objectFit: 'cover' }}
            quality={85} 
            className="z-0" 
            priority={false}
            />

            {/* 3. Overlay Oscuro */}
            <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

            <div className="relative w-full max-w-sm p-10 bg-white rounded-xl shadow-2xl z-20">
                <div className="text-center space-y-2 mb-6">
                    <h1 className="text-3xl font-bold text-blue-700">
                        Crear Nueva Cuenta
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Registra tu microempresa para comenzar.
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={manejar_registro}>
                    {/* Campo Nombre de la Empresa */}
                    <div>
                        <label 
                            htmlFor="nombre_empresa" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nombre de la Empresa
                        </label>
                        <input
                            id="nombre_empresa"
                            name="nombre_empresa"
                            type="text"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                            placeholder="Mi Tiendita"
                            value={nombre_empresa}
                            onChange={(e) => setNombreEmpresa(e.target.value)}
                        />
                    </div>

                    {/* Campo Email */}
                    <div>
                        <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Correo Electrónico (Gerente)
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                            placeholder="gerente@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label 
                            htmlFor="contrasena" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Contraseña
                        </label>
                        <input
                            id="contrasena"
                            name="contrasena"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength="6" // Buena práctica añadir un mínimo
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                            placeholder="••••••••"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                        />
                    </div>
                    
                    {/* Mensajes de Error o Éxito */}
                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}
                    {exito && (
                        <p className="text-sm text-green-600 text-center">{exito}</p>
                    )}

                    {/* Botón de Envío */}
                    <div>
                        <button
                            type="submit"
                            disabled={cargando || exito} // Deshabilita si está cargando o si ya fue exitoso
                            className="w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                        >
                            {cargando ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center text-gray-600 space-y-2">
                <p>
                    ¿Ya tienes una cuenta?
                    <Link href="iniciar_sesion" className="font-medium text-blue-600 hover:text-blue-500">
                    Inicia sesion Aqui
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