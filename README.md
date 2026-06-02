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

La app usa una sola cuenta local por navegador. Guarda borradores automaticamente con `localStorage`, recuerda el ultimo documento abierto y conserva la informacion despues de refrescar la pagina. No hay login ni base de datos todavia; para cuentas reales entre varios gerentes se necesitara agregar backend.

## Exportar en celular

El boton `Exportar PDF` genera y descarga el PDF directamente desde el navegador. En iPhone/iPad, Safari puede abrir el PDF en una pestaña nueva; desde ahi usa el boton de compartir para guardarlo en Archivos o enviarlo.
