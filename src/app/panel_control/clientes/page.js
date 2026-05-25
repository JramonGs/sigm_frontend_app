//  Marca como Componente de Cliente.
'use client';

import React from 'react'; // Importaciones de React.
import { useAuth } from '@/contexto/auth_contexto'; // Hook de autenticacion.
import { obtener_clientes, crear_cliente, actualizar_cliente, eliminar_cliente } from '@/servicios/api_servicio'; // Funciones de API.

export default function PaginaClientes() {
    const { usuario_actual, esta_autenticado } = useAuth(); // Hook de autenticacion.
    const [clientes, definir_clientes] = React.useState([]); // Estado para los clientes.
    const [cargando, definir_cargando] = React.useState(true); // Estado de carga.
    const [error_carga, definir_error_carga] = React.useState(null); // Estado de error de carga.
    
    // Estado para el formulario de Nuevo Cliente.
    const [nuevo_nombre, definir_nuevo_nombre] = React.useState(''); // Estado para el nombre del nuevo cliente.
    const [nuevo_telefono, definir_nuevo_telefono] = React.useState(''); // Estado para el telefono del nuevo cliente.
    const [error_formulario, definir_error_formulario] = React.useState(null); // Estado de error del formulario.

    // Estado para Edición.
    const [editando_cliente_id, definir_editando_cliente_id] = React.useState(null); // Estado para el ID del cliente a editar.
    const [datos_edicion, definir_datos_edicion] = React.useState({ nombre: '', telefono: '' }); // Estado para los datos de edicion.
    const [error_edicion, definir_error_edicion] = React.useState(null); // Estado de error de edicion.
    const [guardando, definir_guardando] = React.useState(false); // Estado de guardado.

    const es_gerente = usuario_actual?.rol === 'Gerente'; // Aqui podremos agregar lógica para roles si es necesario.


    // Efecto para Cargar los Clientes.
    React.useEffect(() => {
        if (esta_autenticado) { // Solo carga si esta autenticado.
            const cargar_clientes = async () => { // Funcion asincrona para cargar.
                try { // Inicio de carga de datos.
                    definir_cargando(true); // Inicia carga.
                    const datos_clientes = await obtener_clientes(); // Llama a la API. 
                    definir_clientes(datos_clientes); // Actualiza estado.
                    definir_error_carga(null); // Limpia errores previos.
                } catch (error) { //Manejo de errores.
                    console.error("Error al cargar clientes:", error); // Log de consola.
                    definir_error_carga("No se pudieron cargar los clientes."); // Mensaje de error.
                } finally { // Siempre se ejecuta al final.
                    definir_cargando(false); // Termina la carga (con exito o error).
                }
            };
            cargar_clientes(); // Llama a la funcion para cargar.
        }
    }, [esta_autenticado]); // Se ejecuta cuando cambia el estado de autenticacion.

    // Función para Agregar Cliente 
    const manejar_agregar_cliente = async (evento) => { // Manejador del envio del formulario.
        evento.preventDefault(); // Previene recarga de pagina.
        definir_error_formulario(null); // Limpia errores previos.

        if (!nuevo_nombre) { // Validación simple
            definir_error_formulario("El nombre es obligatorio."); // Mensaje de error.
            return; // Sale de la funcion.
        }

        try { // Intenta crear el cliente.
            const datos_nuevo_cliente = { // Datos del nuevo cliente.
                nombre: nuevo_nombre,
                telefono: nuevo_telefono || null // Envía null si está vacío
            };
            const cliente_creado = await crear_cliente(datos_nuevo_cliente); // Llamaa a la API. 
            definir_clientes([...clientes, cliente_creado]); // Actualiza estado local
            // Limpia formulario
            definir_nuevo_nombre(''); // Limpia el nombre.
            definir_nuevo_telefono(''); // Limpia el telefono.
        } catch (error) { // Manejo de errores.
            console.error("Error al crear cliente:", error); // Log de consola.
            definir_error_formulario("Error al guardar el cliente."); // Mensaje de error.
        }
    };

    // Funciones para Editar Cliente.
    const iniciar_edicion = (cliente) => { // Inicia la edicion.
        definir_editando_cliente_id(cliente.id); // Define el ID del cliente a editar.
        definir_datos_edicion({ // Llena los datos actuales.
            nombre: cliente.nombre, 
            telefono: cliente.telefono || '' // Asegura que sea string vacío si es null
        });
    };

    const cancelar_edicion = () => { // Cancela la edicion.
        definir_editando_cliente_id(null); // Limpia el ID de edicion.
        definir_datos_edicion({ nombre: '', telefono: '' }); // Limpia los datos de edicion.
        definir_error_edicion(null); // Limpia error de edición al cancelar
    };

    const manejar_cambio_edicion = (evento) => { // Maneja cambios en el formulario de edicion.
        const { name, value } = evento.target; // Extra nombre y valor del campo.
        definir_datos_edicion(prev => ({ ...prev, [name]: value })); // Actualiza el estado de datos de edicion.
    };

    const guardar_edicion = async (id_cliente) => { // Guarda los cambios de edicion,
        definir_error_edicion(null); // Limpia errores previos.
        definir_guardando(true); // Indica que esta guardando.

        if (!datos_edicion.nombre) { // Validación simple.
            definir_error_edicion("El nombre es obligatorio."); // Mensaje de error.
             definir_guardando(false); // Termina el estado de guardado.
            return; // Sale de la funcion.
        }

        try { // Intenta actualizar el cliente.
            const datos_para_actualizar = { // Datos a actualizar.
                nombre: datos_edicion.nombre, 
                telefono: datos_edicion.telefono || null // Envia null si esta vacio.
            };
            const cliente_actualizado = await actualizar_cliente(id_cliente, datos_para_actualizar); // Llama a la API.
            definir_clientes(clientes.map(c => c.id === id_cliente ? cliente_actualizado : c)); // Actualiza estado local.
            cancelar_edicion(); // Cancela la edicion.
        } catch (error) { // Manejo de errores.
            console.error("Error al actualizar cliente:", error); // Log de consola.
            definir_error_edicion("Error al guardar los cambios."); // Mensaje de error.
        } finally { // Siempre se ejecuta al final.
             definir_guardando(false); // Termina el estado de guardado.
        }
    };

    // Función para Eliminar Cliente.
    const manejar_eliminar_cliente = async (id_cliente) => { // Maneja la eliminacion de un cliente por ID.
        if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente ID ${id_cliente}?`)) { // Confirmacion.
            try { // Intenta eliminar el cliente.
                await eliminar_cliente(id_cliente); // Llama a la API.
                definir_clientes(clientes.filter(c => c.id !== id_cliente)); // Actualiza estado local.
            } catch (error) { // Manejo de errores.
                console.error("Error al eliminar cliente:", error); // Log de consola.
                if (error.response?.data?.error) { // Operador de encadenamiento opcional ?.
                    alert(`Error: ${error.response.data.error}`); // Muestra menasaje de error especifico.
                } else { // Manejo de error generico.
                    alert("Error al eliminar el cliente."); // Mensaje generico.
                }
            }
        }
    };

    // Renderizado Condicional.
    if (cargando) return <p className="text-gray-600">Cargando clientes...</p>; // Mensaje de carga.
    if (error_carga) return <p className="text-red-600">{error_carga}</p>; // Mensaje de error.

    // Renderizado Principal.
    return ( // JSX Principal.
        <div>
            <h1 className="text-4xl font-extrabold text-blue-700 mb-8 border-b border-gray-200 pb-4">Gestión de Clientes</h1> 

            {/* --- Formulario para Añadir Cliente --- */}
            {es_gerente &&(
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Añadir Nuevo Cliente</h2>
                {error_formulario && <p className="text-red-500 mb-4">{error_formulario}</p>}
                <form onSubmit={manejar_agregar_cliente} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Nombre */}
                    <div className="md:col-span-1">
                        <label htmlFor="nombre_cliente" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            id="nombre_cliente"
                            value={nuevo_nombre}
                            onChange={(e) => definir_nuevo_nombre(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                        />
                    </div>
                    {/* Telefono */}
                    <div className="md:col-span-1">
                        <label htmlFor="telefono_cliente" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
                        <input
                            type="tel" // Tipo 'tel' para móviles
                            id="telefono_cliente"
                            value={nuevo_telefono}
                            onChange={(e) => definir_nuevo_telefono(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition duration-150 ease-in-out hover:border-blue-400"
                        />
                    </div>
                    {/* Boton */}
                    <div className="flex items-end md:col-span-1">
                        <button type="submit" className="w-full py-2.5 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white transition duration-150 ease-in-out">
                            Agregar Cliente
                        </button>
                    </div>
                </form>
            </div>
            )}

            {/* --- Tabla de Clientes --- */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th /* ID */>ID</th>
                            <th /* Nombre */>Nombre</th>
                            <th /* Telefono */>Teléfono</th>
                            {es_gerente && (
                            <th /* Acciones */>Acciones</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {clientes.length > 0 ? (
                            clientes.map((cliente) => (
                                <tr key={cliente.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    {es_gerente && editando_cliente_id === cliente.id ? (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <input type="text" name="nombre" value={datos_edicion.nombre} onChange={manejar_cambio_edicion} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"/>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <input type="tel" name="telefono" value={datos_edicion.telefono} onChange={manejar_cambio_edicion} className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"/>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button onClick={() => guardar_edicion(cliente.id)} disabled={guardando} className="text-green-600 hover:text-green-800 disabled:opacity-50">
                                                    {guardando ? '...' : 'Guardar'}
                                                </button>
                                                <button onClick={cancelar_edicion} disabled={guardando} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">Cancelar</button>
                                                {error_edicion && <p className="text-red-500 text-xs mt-1">{error_edicion}</p>}
                                            </td>
                                        </>
                                    ) : (
                                        <> 
                                            <td>{cliente.id}</td>
                                            <td>{cliente.nombre}</td>
                                            <td>{cliente.telefono || '-'}</td>
                                            {es_gerente && (
                                            <td>
                                                <button onClick={() => iniciar_edicion(cliente)} className="text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">Editar</button>
                                                <button onClick={() => manejar_eliminar_cliente(cliente.id)} className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out">Eliminar</button>
                                            </td>
                                            )}
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={es_gerente ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500">No hay clientes registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}