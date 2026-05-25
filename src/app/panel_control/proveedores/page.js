// Marca como componente cliente.
'use client';

import React from 'react'; // Importaciones para usar estados.
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_proveedores, crear_proveedor, actualizar_proveedor, eliminar_proveedor } from '@/servicios/api_servicio';
// Funciones de api_servicio aquí más adelante.

export default function PaginaProveedores() {

    // Estados de carga.
    const { esta_autenticado } = useAuth(); // Hook de autenticacion.
    const [proveedores, definir_proveedores] = React.useState([]); // Estado para los proveedores.
    const [cargando, definir_cargando] = React.useState(true); // Estado de carga.
    const [error_carga, definir_error_carga] = React.useState(null); // Estado de error de carga.

    // --- Estados para CREAR ---
    const [nuevo_nombre, definir_nuevo_nombre] = React.useState(''); // Estado para el nombre.
    const [nuevo_telefono, definir_nuevo_telefono] = React.useState(''); // Estado para el telefono.
    const [nuevo_email, definir_nuevo_email] = React.useState(''); // Estado para el email.
    const [nueva_direccion, definir_nueva_direccion] = React.useState(''); // Estado para la direccion.
    const [error_formulario, definir_error_formulario] = React.useState(null); // Estado de error del formulario.
    const [mensaje_exito, definir_mensaje_exito] = React.useState(null); // Estado de mensaje de exito.
    const [enviando, definir_enviando] = React.useState(false); // Estado de envio.

    // --- Estados para EDITAR ---
    const [editando_proveedor_id, definir_editando_proveedor_id] = React.useState(null); // Estado para el ID del proveedor a editar.
    const [datos_edicion, definir_datos_edicion] = React.useState({ nombre: '', telefono: '', email: '', direccion: '' }); // Estado para los datos de edicion.
    const [error_edicion, definir_error_edicion] = React.useState(null); // Estado de error de edicion.
    const [guardando_edicion, definir_guardando_edicion] = React.useState(false); // Estado de guardado de edicion.

    // --- Estados para ELIMINAR ---
    const [error_eliminar, definir_error_eliminar] = React.useState(null); // Estado de error de eliminacion.
    const [mensaje_exito_eliminar, definir_mensaje_exito_eliminar] = React.useState(null); // Estado de mensaje de exito de eliminacion.

    // Efecto para cargar proveedores (se implementará después)
    React.useEffect(() => {
        if (esta_autenticado) {
            const cargar_proveedores = async () => {
                try {
                    definir_cargando(true);
                    const datos_proveedores = await obtener_proveedores();
                    definir_proveedores(datos_proveedores);
                    definir_error_carga(null);
                } catch (error) {
                    console.error("Error al cargar proveedores:", error);
                    definir_error_carga("No se pudieron cargar los proveedores.");
                } finally {
                    definir_cargando(false);
                }
            };
            cargar_proveedores();
        } else {
            definir_cargando(false);
        }
    }, [esta_autenticado]);

    // --- Función para CREAR Proveedor ---
    const manejar_agregar_proveedor = async (evento) => {
        evento.preventDefault();
        definir_error_formulario(null);
        definir_mensaje_exito(null);
        definir_enviando(true);

        if (!nuevo_nombre) {
            definir_error_formulario("El nombre es obligatorio.");
            definir_enviando(false);
            return;
        }

        try {
            const datos_nuevo_proveedor = {
                nombre: nuevo_nombre,
                telefono: nuevo_telefono || null,
                email: nuevo_email || null,
                direccion: nueva_direccion || null
            };
            const proveedor_creado = await crear_proveedor(datos_nuevo_proveedor); // Crea el proveedor.
            definir_proveedores([...proveedores, proveedor_creado]); // Añade a la lista local
            definir_mensaje_exito(`Proveedor "${proveedor_creado.nombre}" agregado con éxito.`); // Mensaje de exito.

            //const lista_actualizada = await obtener_proveedores();
            //definir_proveedores(lista_actualizada);
            // Limpia formulario
            definir_nuevo_nombre(''); // Limpia el nombre.
            definir_nuevo_telefono(''); // Limpia el telefono.
            definir_nuevo_email(''); // Limpia el email.
            definir_nueva_direccion(''); // Limpia la direccion.
        } catch (error) {
            console.error("Error al crear proveedor:", error);
            if (error.response?.data?.error) {
                definir_error_formulario(`Error: ${error.response.data.error}`);
            } else {
                definir_error_formulario("Error al guardar el proveedor.");
            }
        } finally {
            definir_enviando(false);
        }
    };

    // --- Funcion ELIMINAR proveedor ---
    const manejar_eliminar_proveedor = async (id_proveedor) => {
        definir_error_eliminar(null); // Limpia el error de eliminacion.
        definir_mensaje_exito_eliminar(null); // Limpia el mensaje de exito de eliminacion.

        if (window.confirm(`¿Estás seguro de que quieres eliminar al proveedor ID ${id_proveedor}?`)) {
            try {
                await eliminar_proveedor(id_proveedor); // Elimina el proveedor.
                definir_proveedores(proveedores.filter(p => p.id !== id_proveedor)); // Filtra la lista de proveedores.
                definir_mensaje_exito_eliminar(`Proveedor ID ${id_proveedor} eliminado con éxito.`); // Mensaje de exito.
            } catch (error) {
                console.error(`Error al eliminar proveedor ${id_proveedor}:`, error);
                if (error.response?.data?.error) {
                    definir_error_eliminar(`Error al eliminar: ${error.response.data.error}`);
                } else {
                    definir_error_eliminar("Ocurrió un error al intentar eliminar el proveedor.");
                }
            }
        }
    };

     // --- Funcion EDITAR proveedor ---
    const iniciar_edicion = (proveedor) => {
        definir_editando_proveedor_id(proveedor.id);
        definir_datos_edicion({
            nombre: proveedor.nombre,
            telefono: proveedor.telefono || '', // Asegurar strings vacíos si es null
            email: proveedor.email || '',
            direccion: proveedor.direccion || ''
        });
         // Limpiar todos los mensajes y errores al iniciar edición
        definir_error_edicion(null);
        definir_error_formulario(null);
        definir_mensaje_exito_crear(null);
        definir_error_eliminar(null);
        definir_mensaje_exito_eliminar(null);
    };

    const cancelar_edicion = () => {
        definir_editando_proveedor_id(null);
        definir_datos_edicion({ nombre: '', telefono: '', email: '', direccion: '' });
        definir_error_edicion(null);
    };

    const manejar_cambio_edicion = (evento) => {
        const { name, value } = evento.target;
        definir_datos_edicion(prev => ({ ...prev, [name]: value }));
    };

    const guardar_edicion = async (id_proveedor) => {
        definir_error_edicion(null);
        definir_guardando_edicion(true);

        if (!datos_edicion.nombre) {
            definir_error_edicion("El nombre es obligatorio.");
            definir_guardando_edicion(false);
            return;
        }

        try {
            const datos_para_actualizar = {
                nombre: datos_edicion.nombre,
                telefono: datos_edicion.telefono || null,
                email: datos_edicion.email || null,
                direccion: datos_edicion.direccion || null
            };
            const proveedor_actualizado = await actualizar_proveedor(id_proveedor, datos_para_actualizar);
            definir_proveedores(proveedores.map(p => p.id === id_proveedor ? proveedor_actualizado : p));
            cancelar_edicion(); // Salir del modo edición

        } catch (error) {
            console.error(`Error al guardar edición del proveedor ${id_proveedor}:`, error);
            if (error.response?.data?.error) {
                definir_error_edicion(`Error: ${error.response.data.error}`);
            } else {
                definir_error_edicion("Error al guardar los cambios.");
            }
        } finally {
            definir_guardando_edicion(false);
        }
    };

    if (cargando) return <p className="text-gray-600">Cargando...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Proveedores</h1>

            {/* --- Formulario para Añadir Proveedor --- */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Añadir Nuevo Proveedor</h2>
                {error_formulario && <p className="text-red-500 mb-4 text-sm">{error_formulario}</p>}
                {mensaje_exito && <p className="text-green-600 mb-4 text-sm">{mensaje_exito}</p>}

                <form onSubmit={manejar_agregar_proveedor} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Columna 1: Nombre y Teléfono */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nombre_prov" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                type="text" id="nombre_prov" value={nuevo_nombre} required
                                onChange={(e) => definir_nuevo_nombre(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="telefono_prov" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="tel" id="telefono_prov" value={nuevo_telefono}
                                onChange={(e) => definir_nuevo_telefono(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>

                    {/* Columna 2: Email y Dirección */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email_prov" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email" id="email_prov" value={nuevo_email}
                                onChange={(e) => definir_nuevo_email(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="direccion_prov" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <textarea
                                id="direccion_prov" value={nueva_direccion} rows="3"
                                onChange={(e) => definir_nueva_direccion(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Columna 3: Botón */}
                    <div className="flex items-end h-full pt-6"> {/* Alinea el botón abajo */}
                        <button
                            type="submit" disabled={enviando}
                            className={`w-full py-2.5 px-4 font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out ${
                                enviando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                            }`}
                        >
                            {enviando ? 'Agregando...' : 'Agregar Proveedor'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Tabla de Proveedores Existentes --- */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <h2 className="text-xl font-semibold p-4 text-gray-700 border-b">Proveedores Existentes</h2>
                {error_eliminar && <p className="p-4 text-red-600 text-sm">{error_eliminar}</p>}
                {mensaje_exito_eliminar && <p className="p-4 text-green-600 text-sm">{mensaje_exito_eliminar}</p>}
                {cargando ? (
                    <p className="p-4 text-gray-500">Cargando proveedores...</p>
                ) : error_carga ? (
                    <p className="p-4 text-red-600">{error_carga}</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                {/* Futuras columnas aqui. */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-black text-sm">
                            {proveedores.length > 0 ? (
                                proveedores.map((prov) => (
                                    <tr key={prov.id} className="hover:bg-gray-50">
                                        {/* --- MODO EDICIÓN --- */}
                                        {editando_proveedor_id === prov.id ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{prov.id}</td>
                                                {/* Inputs para editar */}
                                                <td className="px-6 py-4"><input type="text" name="nombre" value={datos_edicion.nombre} onChange={manejar_cambio_edicion} className="w-full px-2 py-1 border rounded text-sm"/></td>
                                                <td className="px-6 py-4"><input type="tel" name="telefono" value={datos_edicion.telefono} onChange={manejar_cambio_edicion} className="w-full px-2 py-1 border rounded text-sm"/></td>
                                                <td className="px-6 py-4"><input type="email" name="email" value={datos_edicion.email} onChange={manejar_cambio_edicion} className="w-full px-2 py-1 border rounded text-sm"/></td>
                                                <td className="px-6 py-4"><input type="text" name="direccion" value={datos_edicion.direccion} onChange={manejar_cambio_edicion} className="w-full px-2 py-1 border rounded text-sm"/></td>
                                                {/* Botones Guardar/Cancelar */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button onClick={() => guardar_edicion(prov.id)} disabled={guardando_edicion} className="text-green-600 hover:text-green-800 disabled:opacity-50"> {guardando_edicion ? '...' : 'Guardar'} </button>
                                                    <button onClick={cancelar_edicion} disabled={guardando_edicion} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">Cancelar</button>
                                                    {error_edicion && <p className="text-red-500 text-xs mt-1">{error_edicion}</p>}
                                                </td>
                                            </>
                                        ) : (
                                            /* --- MODO NORMAL --- */
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{prov.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{prov.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{prov.telefono || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{prov.email || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{prov.direccion || '-'}</td>
                                                {/* Botones Editar/Eliminar */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button onClick={() => iniciar_edicion(prov)} className="text-indigo-600 hover:text-indigo-900" disabled={editando_proveedor_id !== null}>Editar</button>
                                                    <button onClick={() => manejar_eliminar_proveedor(prov.id)} className="text-red-600 hover:text-red-900" disabled={editando_proveedor_id !== null}>Eliminar</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    {/* Colspan ahora de 6. */}
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No hay proveedores registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}