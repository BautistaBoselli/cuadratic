# Cuadratic - Prueba tecnica Aldazabal & Cia.

## Tecnnologias

- React
- Next.js
- Typescript
- TailwindCSS
- React query
- Postgres
- Docker

## Instalacion

1. Clonar el repositorio
2. Instalar las dependencias con `npm install`
3. Correr el docker de postgres con `docker-compose up -d`
4. Correr el script de setup de la base de datos
5. Correr el programa con `npm run dev`

Script para crear la base de datos y la tabla de tareas

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL
);

INSERT INTO tasks (title) VALUES ('Tarea 1');
INSERT INTO tasks (title) VALUES ('Tarea 2');
INSERT INTO tasks (title) VALUES ('Tarea 3');
```

## Links comodos

- Documentacion de [React Query](https://react-query.tanstack.com/)
- Documentacion de [TailwindCSS](https://tailwindcss.com/docs)
- Documentacion de [Next.js](https://nextjs.org/docs)
- Documentacion de [pg](https://node-postgres.com/) (libreria para consultas al postgres)

## Tareas

### 1. Crear un esqueleto basico de la aplicacion

Hacer los componentes y el layout basico de la aplicacion leyendo las tareas de la base de datos

Necesario:

- [x] Editar la base de datos para almacenar el estado y fecha de las tareas
- [x] Crear el endpoint para obtener las tareas
- [x] Crear el componente de tareas
- [x] Crear el componente de tareas individuales
- [x] Crear el componente de layout

![](/images/1.png)

### 2. Agregar, borrar y editar tareas

Poder editar y crear tareas nuevas en la aplicacion

Necesario:

- [x] Crear un endpoint para agregar tareas
- [x] Crear un endpoint para editar tareas
- [x] Crear un endpoint para borrar tareas
- [x] Crear el componente de formulario
- [x] Modificar el componente de tareas para poder editarlas/borrarlas
- [x] Actualizar las tareas luego de ser agregadas/editadas

![](/images/2.png)

### 3. Tareas por usuario

Hasta ahora las tareas eran "globales" y cualquiera veia todas las tareas,
para el siguiente paso vamos a hacer que las tareas sean por usuario.

El usuario crea poniendo el username y aprentando "Login", no es necesaria
una contraseña, ni registro previo, ni queda guardada la sesion en cookies (solo un useState de la app).

Mientras el usuario no esta registrado, no ve ninguna tarea ni puede crearlas

Necesario:

- [x] Crear el componente donde se especifica el username y almacenar el valor de login
- [x] Actualizar la tabla de tareas para que tenga un campo de usuario
- [x] Actualizar los endpoints para que las tareas sean por usuario
- [x] Hacer que no se pueda crear tareas si no estas logeado

![](/images/3.png)

### 4. Ordenamiento

Agregar la posibilidad de ordenar las tareas por fecha y por estado

Necesario:

- [x] Agregar un campo de fecha a las tareas
- [x] Agregar un select para ordenar las tareas

![](/images/4.png)

### 5. Agregar delay y optimistic

Vamos a fingir delay en los endpoints para mas realismo, pero para mantener la aplicacion rapida
vamos a usar optimistic updates con react query

Necesario:

- [x] Agregar un input donde se pueda poner el delay
- [x] Que los endpoints reciban este delay como parametro y lo fingan con un sleep
- [x] Agregar optimistic updates a la lista de tareas para mantener la responsiness

![](/images/5.png)
