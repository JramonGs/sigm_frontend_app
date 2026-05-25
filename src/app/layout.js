import { Inter } from "next/font/google"; // Importa la fuente Inter desde Google Fonts
import "./globals.css"; // Importa los estilos globales
import { AuthProveedor  } from "@/contexto/auth_contexto"; // Importa el proveedor de contexto de autenticación

const inter = Inter({ subsets: ["latin"] }); // Define la fuente.

export const metadata = {
  title: "SIGM - Sistema de Gestión de Inventarios y Ventas",
  description: "Sistema para gestionar inventarios y ventas de manera eficiente en microempresas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={inter.className}
      >
        <AuthProveedor> 
        {children}
        </AuthProveedor>
      </body>
    </html>
  );
}
