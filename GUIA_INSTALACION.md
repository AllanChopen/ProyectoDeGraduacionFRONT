# 📦 Guía de Instalación y Ejecución

Esta guía te ayudará a instalar y ejecutar el proyecto **Proyecto de Graduación FRONT** en tu computadora.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
  - Descárgalo desde: https://nodejs.org/
  - Verifica la instalación: `node --version` y `npm --version`
- **Git** (opcional, pero recomendado para clonar repositorios)
  - Descárgalo desde: https://git-scm.com/
- **Un editor de código** como VS Code (recomendado)
  - Descárgalo desde: https://code.visualstudio.com/

---

## 🚀 Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

**Opción A: Usando Git (recomendado)**
```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-frontend
```

**Opción B: Descargar como ZIP**
- Descarga el archivo ZIP del proyecto
- Extrae la carpeta
- Abre una terminal en la carpeta `proyecto-frontend`

### 2. Instalar Dependencias

Ejecuta el siguiente comando en la terminal dentro de la carpeta del proyecto:

```bash
npm install
```

Este comando instalará todas las dependencias necesarias (React, React Router, Vite, etc.).

### 3. Configurar Variables de Entorno

El proyecto necesita conectarse a una API backend. Debes crear un archivo `.env` en la raíz del proyecto:

```bash
# En la carpeta proyecto-frontend, crea un archivo llamado .env
```

**Contenido del archivo `.env`:**
```
VITE_API_URL=http://localhost:8000
```

⚠️ **Nota:** Reemplaza `http://localhost:8000` con la URL correcta de tu API backend.

---

## ▶️ Ejecutar el Proyecto

### Modo Desarrollo (Desarrollo Local)

```bash
npm run dev
```

Este comando:
- Inicia el servidor de desarrollo de Vite
- Habilita **Hot Module Replacement (HMR)** (los cambios se reflejan automáticamente)
- La aplicación estará disponible en: `http://localhost:5173`

### Modo Producción (Compilar para publicar)

```bash
npm run build
```

Este comando:
- Compila el proyecto para producción
- Genera una carpeta `dist/` con los archivos optimizados
- Los archivos estarán listos para desplegar en un servidor web

### Vista Previa de Producción

Para probar cómo se ve en producción:

```bash
npm run preview
```

---

## 🔍 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila el proyecto para producción |
| `npm run preview` | Vista previa de la compilación de producción |
| `npm run lint` | Revisa el código en busca de errores (Oxlint) |

---

## 📁 Estructura del Proyecto

```
proyecto-frontend/
├── src/
│   ├── Components/        # Componentes reutilizables
│   │   ├── Footer/
│   │   ├── NavBar/
│   │   ├── ProtectedRoute/
│   │   └── ...
│   ├── Pages/             # Páginas de la aplicación
│   │   ├── Landing/
│   │   ├── Login/
│   │   ├── Blog/
│   │   ├── Dashboard/
│   │   └── ...
│   ├── api/               # Llamadas a la API
│   │   ├── apiClient.js   # Cliente HTTP base
│   │   ├── authApi.js
│   │   ├── bandApi.js
│   │   └── ...
│   ├── context/           # Context API de React
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── utils/             # Funciones utilitarias
│   │   ├── authSessionStorage.js
│   │   └── jwt.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/                # Archivos estáticos (fonts, iconos)
├── package.json           # Dependencias del proyecto
├── vite.config.js         # Configuración de Vite
└── index.html             # Archivo HTML principal
```

---

## 🔐 Configuración de Autenticación

El proyecto usa un sistema de autenticación basado en tokens JWT. Los tokens se almacenan usando `authSessionStorage.js`.

**Para que funcione correctamente:**
1. Asegúrate de que tu API backend esté corriendo
2. La URL de la API debe estar configurada en el archivo `.env`
3. Los endpoints de autenticación deben estar disponibles en la API

---

## 🛒 Funcionalidades Principales

- **Landing Page**: Página de inicio
- **Blog**: Visualización de publicaciones
- **Tienda**: Catálogo de productos
- **Carrito de Compras**: Gestión del carrito
- **Tickets**: Sistema de compra de entradas
- **Panel de Control (Dashboard)**: Para usuarios administradores
- **Página Pública de Banda**: Información de la banda

---

## 🐛 Solución de Problemas

### Error: "npm: command not found"
- **Solución:** Node.js/npm no está instalado. Descarga e instala desde https://nodejs.org/

### Error: "VITE_API_URL is not defined"
- **Solución:** Crea el archivo `.env` en la raíz del proyecto con la URL de tu API

### La aplicación no se conecta a la API
- **Solución:** Verifica que:
  1. La URL en `.env` sea correcta
  2. El servidor de API esté corriendo
  3. No haya problemas de CORS en la API

### Puerto 5173 ya está en uso
- **Solución:** Cambia el puerto en `vite.config.js`:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5174
    }
  })
  ```

---

## 📱 Tecnologías Utilizadas

- **React** 19.2.8 - Librería de UI
- **React Router DOM** 7.18.3 - Enrutamiento
- **Vite** 8.2.0 - Herramienta de construcción
- **CSS** - Estilos (sin framework CSS, estilos personalizados)

---

## 🤝 Información de Contacto

Si tienes dudas o problemas durante la instalación, contacta al equipo de desarrollo.

---

## 📝 Notas Importantes

✅ Asegúrate de que el backend esté corriendo en la URL especificada en `.env`  
✅ El proyecto usa **React Router v7**, que es la versión más reciente  
✅ Los estilos CSS son personalizados (sin Tailwind, Bootstrap, etc.)  
✅ La autenticación se maneja con JWT tokens almacenados en session storage

---

**¡Listo! Ya puedes ejecutar el proyecto. 🎉**

Si necesitas ayuda, revisa la documentación oficial:
- https://vite.dev/
- https://react.dev/
- https://reactrouter.com/
