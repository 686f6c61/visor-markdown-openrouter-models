# 🚀 Guía de Deployment en Vercel

## Configuración de Variables de Entorno

Antes de hacer el deployment, configura las siguientes variables de entorno en Vercel:

### Variables Requeridas:
- `REACT_APP_OPENROUTER_API_KEY`: Tu API key de OpenRouter
  - Valor: `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`

### Variables Opcionales:
- `REACT_APP_OPENROUTER_BASE_URL`: URL base de la API (por defecto: https://openrouter.ai/api/v1)
- `REACT_APP_APP_NAME`: Nombre de la aplicación
- `REACT_APP_VERSION`: Versión de la aplicación

## Pasos para Deploy:

1. **Conectar repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio `visor-markdown-openrouter-models`

2. **Configurar variables de entorno**
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Añade `REACT_APP_OPENROUTER_API_KEY` con tu API key

3. **Deploy automático**
   - Vercel detectará automáticamente que es una app React
   - El build se ejecutará automáticamente
   - La app estará disponible en tu dominio de Vercel

## Configuración del Build:

- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`
- **Development Command**: `npm start`

## Dominio Sugerido:
- `visor-markdown-vitaminado.vercel.app`

## Notas Importantes:

- El archivo `vercel.json` ya está configurado para SPA routing
- Las variables de entorno se cargan automáticamente
- El cache está optimizado para archivos estáticos
- Todos los modelos de IA son gratuitos, no hay límites de costo 