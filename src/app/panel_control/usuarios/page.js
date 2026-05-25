// Marca como Componente de Cliente.
'use client';

import React from 'react'; // Importa useState y useEffect.
import { useAuth } from '@/contexto/auth_contexto'; // Importa el hook de autenticacion.
import { crear_usuario, obtener_usuarios, actualizar_usuario, eliminar_usuario } from '@/servicios/api_servicio'; // Importa la funcion para crear un usuario y obtener usuarios.

// Funcion principal del componente.
export default function PaginaGestionUsuarios() {
    const { usuario_actual } = useAuth(); // Obtén info del usuario actual
    const es_gerente = usuario_actual?.rol === 'Gerente'; // Verifica si es Gerente

    // Estados para el formulario
    const [email, definir_email] = React.useState(''); // Email del usuario.
    const [contrasena, definir_contrasena] = React.useState(''); // Contraseña del usuario.
    const [nombre_completo, definir_nombre_completo] = React.useState(''); // Nombre completo.
    const [rol_nuevo, definir_rol_nuevo] = React.useState('Empleado'); // Rol por defecto
    const [error_formulario, definir_error_formulario] = React.useState(null); // Error del formulario.
    const [mensaje_exito, definir_mensaje_exito] = React.useState(null); // Mensaje de exito.
    const [enviando, definir_enviando] = React.useState(false); // Para deshabilitar botón

    // --- Estados para LISTAR usuarios ---
    const [usuarios, definir_usuarios] = React.useState([]); // Array para la lista
    const [cargando_usuarios, definir_cargando_usuarios] = React.useState(true); // Estado de carga para la tabla
    const [error_carga_usuarios, definir_error_carga_usuarios] = React.useState(null); // Error al cargar la tabla

    // --- Estados para EDITAR usuarios ---
    const [editando_usuario_id, definir_editando_usuario_id] = React.useState(null); // ID del usuario en edición
    const [datos_edicion, definir_datos_edicion] = React.useState({ rol: '' }); // Datos temporales de edición (solo rol)
    const [error_edicion, definir_error_edicion] = React.useState(null); // Error de edicion.
    const [guardando_edicion, definir_guardando_edicion] = React.useState(false); // Estado de guardado de edicion.

    // --- Estados para ELIMINAR usuarios ---
    const [error_eliminar, definir_error_eliminar] = React.useState(null); // Para mostrar errores al eliminar.
    const [mensaje_exito_eliminar, definir_mensaje_exito_eliminar] = React.useState(null); // Para mostrar mensaje de exito al eliminar.

    // --- Efecto para CARGAR la lista de usuarios ---
    React.useEffect(() => {
        // Solo carga si es gerente y el componente se ha montado
        if (es_gerente) {
            const cargar_usuarios = async () => {
                try {
                    definir_cargando_usuarios(true);
                    const lista_usuarios = await obtener_usuarios();
                    definir_usuarios(lista_usuarios);
                    definir_error_carga_usuarios(null);
                } catch (error) {
                    console.error("Error al cargar lista de usuarios:", error);
                    definir_error_carga_usuarios("No se pudo cargar la lista de usuarios.");
                } finally {
                    definir_cargando_usuarios(false);
                }
            };
            cargar_usuarios();
        } else {
             definir_cargando_usuarios(false); // Si no es gerente, no hay nada que cargar
        }
    }, [es_gerente]); // Se ejecuta si cambia el estado de 'es_gerente'

    // Función para manejar el envío del formulario
    const manejar_submit_crear = async (evento) => {
        evento.preventDefault();
        definir_error_formulario(null);
        definir_mensaje_exito(null);
        definir_enviando(true);
        definir_error_eliminar(null); // Limpiar errores previos de eliminación
        definir_mensaje_exito_eliminar(null); // Limpiar mensaje de éxito de eliminación

        try {
            const datos_nuevo_usuario = { email, contrasena, rol: rol_nuevo, nombre_completo }; // Prepara los datos.
            const usuario_creado = await crear_usuario(datos_nuevo_usuario); // Llama a la API para crear el usuario.
            const lista_actualizada = await obtener_usuarios(); // Llama a la API para obtener la lista actualizada.
            definir_mensaje_exito(`Usuario ${usuario_creado.email} creado con éxito.`); // Mensaje de exito.
            
            // Limpiar formulario
            definir_email(''); // Limpia el campo email.
            definir_contrasena(''); // Limpia el campo contraseña.
            definir_nombre_completo(''); // Limpia el campo nombre completo.
            definir_rol_nuevo('Empleado'); // Resetea el rol al valor por defecto.
            definir_usuarios(lista_actualizada); // Actualiza la lista con la obtenida de la API.
            

        } catch (error) {
            console.error("Error al crear usuario desde el frontend:", error);
            if (error.response?.data?.error) {
                definir_error_formulario(`Error: ${error.response.data.error}`);
            } else {
                definir_error_formulario("Ocurrió un error al crear el usuario.");
            }
        } finally {
            definir_enviando(false);
        }
    };

    // Funcion para manejar la eliminacion de un usuario.
    const manejar_eliminar = async (id_usuario) => {
        definir_error_eliminar(null); // Limpiar errores previos de eliminación
        //definir_mensaje_exito_crear(null); // Limpiar mensaje de éxito de creación
        definir_mensaje_exito_eliminar(null); // Limpiar mensaje de éxito de eliminación

        if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ID ${id_usuario}?`)) {
            try {
                await eliminar_usuario(id_usuario);
                // Actualiza el estado local filtrando el usuario eliminado
                definir_usuarios(usuarios.filter(u => u.id !== id_usuario));
                definir_mensaje_exito_eliminar(`Usuario ID ${id_usuario} eliminado con éxito.`);
            } catch (error) {
                console.error(`Error al eliminar usuario ${id_usuario}:`, error);
                if (error.response?.data?.error) {
                    definir_error_eliminar(`Error al eliminar: ${error.response.data.error}`);
                } else {
                    definir_error_eliminar("Ocurrió un error al intentar eliminar el usuario.");
                }
            }
        }
    };

    const iniciar_edicion = (usuario) => {
        definir_editando_usuario_id(usuario.id);
        definir_datos_edicion({ rol: usuario.rol }); // Carga el rol actual
        definir_error_edicion(null); // Limpia errores de edición previos
        definir_mensaje_exito_crear(null); // Limpiar mensaje de creación
        definir_error_eliminar(null); // Limpiar error de eliminar
        definir_mensaje_exito_eliminar(null); // Limpiar mensaje de éxito de eliminación
    };

    const cancelar_edicion = () => {
        definir_editando_usuario_id(null);
        definir_datos_edicion({ rol: '' });
        definir_error_edicion(null);
    };

    const manejar_cambio_edicion = (evento) => {
        // Solo tenemos el campo 'rol' por ahora
        definir_datos_edicion({ rol: evento.target.value });
    };

    const guardar_edicion = async (id_usuario) => {
        definir_error_edicion(null);
        definir_guardando_edicion(true);

        try {
            const datos_para_actualizar = { rol: datos_edicion.rol };
            const usuario_actualizado = await actualizar_usuario(id_usuario, datos_para_actualizar);

            // Actualiza la lista local
            definir_usuarios(usuarios.map(u => u.id === id_usuario ? usuario_actualizado : u));
            cancelar_edicion(); // Salir del modo edición

        } catch (error) {
            console.error(`Error al guardar edición del usuario ${id_usuario}:`, error);
            if (error.response?.data?.error) {
                definir_error_edicion(`Error: ${error.response.data.error}`);
            } else {
                definir_error_edicion("Error al guardar los cambios.");
            }
        } finally {
            definir_guardando_edicion(false);
        }
    };

    // Si no es Gerente, no muestra nada o un mensaje
    if (!es_gerente && !cargando_usuarios) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-700">Esta sección es solo para Gerentes.</p>
            </div>
        );
    }

    // Renderizado para el Gerente
    return (
        <div>
            <h1 className="text-4xl font-extrabold text-blue-700 mb-8 border-b border-gray-200 pb-4">Gestión de Usuarios</h1>

            {/* --- Formulario para Crear Usuario --- */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Crear Nuevo Usuario</h2>
                {error_formulario && <p className="text-red-500 mb-4 text-sm">{error_formulario}</p>}
                {mensaje_exito && <p className="text-green-600 mb-4 text-sm">{mensaje_exito}</p>}

                <form onSubmit={manejar_submit_crear} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                    {/* Nombre Completo */}
                    <div className="md:col-span-1">
                        <label htmlFor="nombre_completo_usuario" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            id="nombre_completo_usuario"
                            value={nombre_completo}
                            onChange={(e) => definir_nombre_completo(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Nombre del Empleado"
                        />
                    </div>
                    {/* Email */}
                    <div className="md:col-span-1">
                        <label htmlFor="email_usuario" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email_usuario"
                            value={email}
                            onChange={(e) => definir_email(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                    {/* Contraseña */}
                    <div className="md:col-span-1">
                        <label htmlFor="contrasena_usuario" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena_usuario"
                            value={contrasena}
                            onChange={(e) => definir_contrasena(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="••••••••"
                        />
                    </div>
                    {/* Rol */}
                    <div className="md:col-span-1">
                        <label htmlFor="rol_usuario" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            id="rol_usuario"
                            value={rol_nuevo}
                            onChange={(e) => definir_rol_nuevo(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                        >
                            <option value="Empleado">Empleado</option>
                            <option value="Gerente">Gerente</option>
                        </select>
                    </div>
                    {/* Botón Crear */}
                    <div className="flex items-end md:col-span-1">
                        <button
                            type="submit"
                            disabled={enviando}
                            className={`w-full py-2 px-4 font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out ${
                                enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                        >
                            {enviando ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Tabla para Listar Usuarios --- */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <h2 className="text-xl font-semibold p-4 text-gray-700 border-b">Usuarios Existentes</h2>
                {error_eliminar && <p className="p-4 text-red-600 text-sm">{error_eliminar}</p>}
                {mensaje_exito_eliminar && <p className="p-4 text-green-600 text-sm">{mensaje_exito_eliminar}</p>}
                {cargando_usuarios ? (
                    <p className="p-4 text-gray-500">Cargando usuarios...</p>
                ) : error_carga_usuarios ? (
                    <p className="p-4 text-red-600">{error_carga_usuarios}</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                            {usuarios.length > 0 ? (
                                usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                    {editando_usuario_id === usuario.id ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{usuario.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-550">{usuario.nombre_completo || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* Select para cambiar el rol */}
                                                    <select
                                                        value={datos_edicion.rol}
                                                        onChange={manejar_cambio_edicion}
                                                        disabled={guardando_edicion}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm bg-white"
                                                    >
                                                        <option value="Empleado">Empleado</option>
                                                        <option value="Gerente">Gerente</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => guardar_edicion(usuario.id)}
                                                        disabled={guardando_edicion}
                                                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                                    >
                                                        {guardando_edicion ? '...' : 'Guardar'}
                                                    </button>
                                                    <button
                                                        onClick={cancelar_edicion}
                                                        disabled={guardando_edicion}
                                                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    {/* Mostrar error de edición específico de la fila */}
                                                    {error_edicion && <p className="text-red-500 text-xs mt-1">{error_edicion}</p>}
                                                </td>
                                            </>
                                        ) : (

                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{usuario.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{usuario.nombre_completo || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        usuario.rol === 'Gerente' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {usuario.rol}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    {/* Botón Editar: No editar al gerente actual */}
                                                    {usuario.id !== usuario_actual.id && (
                                                        <button
                                                            onClick={() => iniciar_edicion(usuario)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            disabled={editando_usuario_id !== null} // Deshabilita si ya hay otro en edición
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {/* Botón Eliminar: No eliminar al gerente actual */}
                                                    {usuario.id !== usuario_actual.id && (
                                                        <button
                                                            onClick={() => manejar_eliminar(usuario.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            disabled={editando_usuario_id !== null} // Deshabilita si hay otro en edición
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay usuarios registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}