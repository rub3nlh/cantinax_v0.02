# LaCantinaXL - Comida Cubana a Domicilio v0.021

LaCantinaXL es una plataforma que permite a personas en el extranjero enviar comidas caseras cubanas a sus familiares en Cuba.

## 🚀 Características

- Selección de paquetes de comidas (3, 5 o 7 días)
- Menú variado de comida cubana tradicional
- Sistema de entregas programadas
- Gestión de direcciones de entrega
- Seguimiento de órdenes en tiempo real
- Autenticación de usuarios
- Interfaz responsive y moderna
- Procesamiento de pagos con TropiPay
- API REST para integraciones

## 📋 Requisitos Previos

- Node.js 18.0.0 o superior
- npm 9.0.0 o superior
- Cuenta de Supabase (para la base de datos)

## 🛠️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/lacantinaxl.git
   cd lacantinaxl
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto
   - Añade las siguientes variables:
     ```
     VITE_SUPABASE_URL=tu_url_de_supabase
     VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
     PORT=3000
     NODE_ENV=development
     SERVER_URL=http://localhost:3000
     ```

4. Configura la base de datos:
   - Asegúrate de tener una cuenta en Supabase
   - Ejecuta las migraciones ubicadas en `/supabase/migrations`
   - Las migraciones crearán todas las tablas necesarias y configurarán las políticas de seguridad

5. Inicia los servidores de desarrollo:
   ```bash
   npm run dev
   ```
   Este comando iniciará:
   - El servidor de desarrollo de Vite (frontend)
   - El servidor Express (backend)

## 📦 Estructura del Proyecto

```
lacantinaxl/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── hooks/         # Custom hooks de React
│   ├── lib/           # Utilidades y configuraciones
│   ├── pages/         # Componentes de página
│   ├── data/          # Datos estáticos
│   └── types/         # Definiciones de TypeScript
├── server/
│   └── index.js       # Servidor Express
├── supabase/
│   └── migrations/    # Migraciones de la base de datos
├── public/            # Archivos estáticos
└── ...
```

## 🔧 Tecnologías Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router DOM

### Backend
- Node.js
- Express
- Cors
- Dotenv

### Base de Datos y Autenticación
- Supabase
  - Autenticación de usuarios
  - Base de datos PostgreSQL
  - Row Level Security (RLS)
  - Políticas de seguridad

### Desarrollo
- Concurrently (para ejecutar múltiples servidores)
- ESLint
- TypeScript
- Vite

## 🚀 Despliegue

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos de distribución se generarán en el directorio `dist/`.

## 📝 API Endpoints

### Servidor Express

- `GET /health`: Endpoint de verificación de salud del servidor
- `POST /create-payment-link`: Crea un enlace de pago con TropiPay

## 🔐 Seguridad

- Autenticación de usuarios mediante Supabase
- Row Level Security (RLS) en todas las tablas
- Políticas de seguridad granulares
- CORS configurado para el servidor Express
- Variables de entorno para datos sensibles

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE.md](LICENSE.md) para detalles

## 🤝 Contribuir

1. Haz un Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes alguna pregunta o problema:

- Abre un issue en GitHub
- Envía un correo a support@lacantinaxl.com
- Visita nuestra [página de soporte](https://lacantinaxl.com/support)

## 🔄 Scripts Disponibles

- `npm run dev`: Inicia los servidores de desarrollo (frontend y backend)
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Vista previa de la build de producción
- `npm run lint`: Ejecuta el linter
- `npm run server`: Inicia solo el servidor Express