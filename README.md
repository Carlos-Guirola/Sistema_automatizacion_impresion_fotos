# SISTEMA TOOLSPRINT

ToolsPrint es una plataforma diseñada para automatizar la preparación e impresión de fotografías tipo Polaroid y fotografías convencionales, permitiendo generar documentos listos para imprimir en cuestión de segundos.

El sistema elimina la necesidad de organizar imágenes manualmente en herramientas como Word o Canva, reduciendo tiempos de trabajo y errores en el proceso de impresión.

---

# Funcionalidades Principales

* Generación automática de diseños tipo Polaroid.
* Generación de fotografías completas.
* Selección masiva de fotografías desde una carpeta.
* Generación de documentos PDF listos para imprimir.
* Generación de documentos Word (.docx).
* Vista previa antes de exportar.
* Personalización de marcos Polaroid.
* Agregar frases personalizadas.
* Agregar fechas.
* Agregar iconos decorativos.
* Personalización de colores de texto.
* Gestión de usuarios.
* Gestión de empresas.
* Sistema de prueba gratuita.
* Activación administrativa de usuarios.

---

# Página Principal

Vista principal del sistema donde los usuarios pueden conocer las funcionalidades de ToolsPrint, los beneficios de la automatización de impresiones fotográficas y acceder al registro o inicio de sesión.

![Home](docs/home.png)

---

# Registro de Usuarios

Formulario de registro para nuevos usuarios.

![Registro](docs/registro.png)

---

# Inicio de Sesión

Pantalla de acceso para usuarios registrados dentro de la plataforma.

![Login](docs/login.png)

---

# Vista Previa de Impresión

Permite visualizar el resultado final antes de generar el documento, asegurando que las fotografías se encuentren correctamente organizadas y listas para imprimir.

![Preview](docs/preview.png)

---

# Personalización de Polaroids

Herramienta para personalizar las fotografías agregando colores al marco, frases, fechas e iconos decorativos antes de generar el documento final.

![Personalización](docs/perzonalizacion.png)

---

# Opciones Avanzadas de Personalización

Configuraciones adicionales para personalizar el diseño de las Polaroids y adaptar el resultado a diferentes estilos y ocasiones.

![Personalización 2](docs/perzonalizacion2.png)

---

# Registro y Activación de Usuarios

ToolsPrint cuenta con un sistema de acceso controlado mediante períodos de prueba y aprobación administrativa.

## Flujo de Registro

1. El usuario completa el formulario de registro.
2. La información es almacenada en la base de datos.
3. El sistema crea automáticamente la cuenta del usuario.
4. El usuario obtiene acceso inmediato a la plataforma.
5. Se activa una prueba gratuita de 15 días.
6. Durante este período el usuario puede utilizar todas las herramientas disponibles.
7. Al finalizar los 15 días de prueba, la cuenta es desactivada automáticamente.
8. La solicitud pasa al panel administrativo para revisión.
9. El administrador evalúa la información proporcionada por el usuario.
10. Si la solicitud es aprobada:

    * Se asigna una empresa al usuario.
    * La cuenta es reactivada.
    * Se otorgan 30 días adicionales de acceso.
11. Si la solicitud es rechazada, el usuario no podrá continuar utilizando la plataforma.

## Prueba Gratuita

Todos los usuarios nuevos reciben una prueba gratuita de 15 días para conocer y evaluar las funcionalidades disponibles dentro del sistema.

## Activación Administrativa

Después del período de prueba, la continuidad del acceso depende de la aprobación realizada por el administrador.

La aprobación permite:

* Reactivar la cuenta.
* Asociar al usuario con una empresa.
* Extender el acceso por 30 días.
* Habilitar nuevamente el uso de las herramientas.

## Control de Acceso

Actualmente el sistema incluye:

* Registro de usuarios.
* Prueba gratuita de 15 días.
* Desactivación automática al finalizar la prueba.
* Panel de aprobación administrativa.
* Asociación de usuarios a empresas.
* Reactivación manual de cuentas.
* Extensión de acceso por períodos definidos.

---

# Beneficios

## Método Tradicional

* Abrir fotografías una por una.
* Ajustar tamaños manualmente.
* Organizar imágenes en Word o Canva.
* Crear PDFs manualmente.
* Corregir errores de impresión.

Tiempo estimado: 15 a 30 minutos.

## Con ToolsPrint

* Seleccionar carpeta de fotografías.
* Elegir formato de impresión.
* Personalizar diseño.
* Generar PDF o Word.
* Imprimir.

Tiempo estimado: Menos de 10 segundos.

---

# Tecnologías Utilizadas

## Frontend

* React
* Vite
* React Router
* CSS

## Backend

* Node.js
* Express
* JWT
* Multer
* PDF-Lib

## Base de Datos

* MySQL


# Importante

Este proyecto NO incluye migraciones automáticas de base de datos.

La base de datos debe crearse manualmente ejecutando el script SQL ubicado en:

```text
backend/src/database/base1.sql
```

Antes de iniciar el sistema es necesario crear la base de datos y ejecutar dicho script desde MySQL Workbench o cualquier cliente MySQL compatible.

---

# Autor

Carlos Guirola

2026 - ToolsPrint
