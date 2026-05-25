// Marca como Componente de Cliente.
'use client'; 

import React, { createContext, useState, useContext, useEffect } from 'react'; // Importa funciones de React.
import { useRouter } from 'next/navigation'; // Importacion de navegacion.
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tener esta librería instalada.

// Crea el Contexto.
const AuthContexto = createContext(null); // Crea el contexto.

// --- Crea el Proveedor del Contexto ---
// Este componente envolverá toda tu aplicación
export function AuthProveedor({ children }) {
    const [usuario, definir_usuario] = React.useState(null); // Estado para guardar la info del usuario
    const [cargando, definir_cargando] = React.useState(true); // Para saber si estamos verificando el token
    const router = useRouter(); // Hook de navegacion.

    // Efecto para verificar el token al cargar la app.
    React.useEffect(() => {
        const token = localStorage.getItem('token_jwt');
        if (token) {
            try {
                const usuario_decodificado = jwtDecode(token); // Decodifica el token JWT. 
                definir_usuario(usuario_decodificado); // Guarda la informacion del usuario en el estado.
            } catch (error) { // Maneja errores de decodificacion.
                // Si el token es inválido o corrupto, lo limpiamos
                console.error("Error al decodificar token del localStorage:", error); // Opcional: Loguea el error para depuracion.
                localStorage.removeItem('token_jwt'); // Elimina el token invalido.
            }
        }
        definir_cargando(false); // Termina la verificacion.
    }, []);

    // Función de Login (actualiza el estado y guarda el token).
    const iniciar_sesion = (token_recibido) => {
        localStorage.setItem('token_jwt', token_recibido); // Guarda el token en el localStorage.
        try {
            const usuario_decodificado = jwtDecode(token_recibido); // Decodifica el token JWT al iniciar sesión.
            definir_usuario(usuario_decodificado); // Guarda la informacion del usuario en el estado.
            router.push('/panel_control'); // Redirige al panel de control tras iniciar sesion.
        } catch (error) { // Maneja errores de decodificacion.
             console.error("Error al decodificar token recibido:", error); // Opcional: Loguea el error para depuracion.
             definir_usuario(null); // Asegura que no quede logueado si el token es malo.
        }
    };

    // Función de Logout (limpia el estado y el localStorage).
    const cerrar_sesion = () => {
        localStorage.removeItem('token_jwt'); // Elimina el token del almacenamiento.   
        definir_usuario(null); // Limpia la informacion del usuario en el estado.
        router.push('/iniciar_sesion'); // Redirige a la página de login.
    };

    // Función para obtener el token actual.
    const obtener_token = () => { // Retorna el token JWT almacenado.
        return localStorage.getItem('token_jwt');
    };

    // Valor que compartirá el contexto.
    const valor = {
        usuario_actual: usuario, // Quién está logueado (o null).
        esta_autenticado: !!usuario, // true si hay usuario, false si no
        cargando_auth: cargando, // Para mostrar un 'spinner' mientras se verifica.
        iniciar_sesion,
        cerrar_sesion,
        obtener_token
    };

    // Retorna el proveedor con el valor compartido
    return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

// Hook personalizado para usar el contexto.
// Esto hace más fácil acceder al contexto desde otros componentes.
export function useAuth() {
    return useContext(AuthContexto);
}

