# Filldocs Reportes

App estatica para capturar y exportar reportes de La Calle de las Sirenas.

## Documentos incluidos

- Rendicion de Cuentas
- RESULTADOS DE ENERO 2026

## Ejecutar local

```powershell
python -m http.server 5173
```

Abre:

```text
http://127.0.0.1:5173/
```

## Publicar en GitHub Pages

1. Sube este repositorio a GitHub.
2. En GitHub, entra a `Settings` -> `Pages`.
3. En `Build and deployment`, selecciona `Deploy from a branch`.
4. En `Branch`, selecciona `main` y carpeta `/ (root)`.
5. Guarda. GitHub generara una URL tipo:

```text
https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/
```

## Importante

Este repo debe contener solo la app estatica. No subas los PPTX, PDF ni XLSX originales.

La app tiene un login simple de un usuario:

- Usuario: `Ritchie68`
- Contraseña: `Sirenas2026!`

La sesion queda guardada en el dispositivo y los borradores se guardan bajo esa cuenta usando `localStorage`. Este login es suficiente para el uso interno actual en GitHub Pages, pero no es seguridad real de produccion porque una app estatica expone su JavaScript. Para varios gerentes con cuentas reales se necesitara agregar backend/base de datos.

## Exportar en celular

El boton `Exportar PDF` genera el PDF directamente desde el navegador. En Safari/iPhone/iPad no abre una pestaña vacía mientras genera; cuando termina, muestra un aviso `PDF listo` dentro de la app con el boton `Abrir / compartir PDF`.
