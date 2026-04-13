# Instrucciones de configuración del entorno de trabajo
Se adjuntan los comandos necearios para el desarrollo del proyecto.

## 
Instalamos Node.js, angularcli, postgresql (desde la web en .exe)
```bash
npm install -g @angular/cli
```

Estructura de carpetas del backend:
```
npm init -y
npm install express pg bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon typescript ts-node nodemon
npm install --save-dev @types/express @types/pg @types/cors @types/bcrypt @types/jsonwebtoken @types/node
npx tsc --init

```
El primer comando crea un esqueleto de archivo package.json. En él, se especificarán las dependencias necesarias de Node.js para el desarrollo de la aplicación. npm (Node.js Package Manager) es el administrador de módulos de Node.js y se instala con él 
Las librerías que hemos instalado en el segundo comando son:
-	express    → framework web (crea el servidor HTTP)
-	pg         → driver para conectar a PostgreSQL
-	bcryptjs   → hashear contraseñas de forma segura
-	jsonwebtoken → crear y verificar tokens JWT
-	cors       → permitir peticiones desde Angular (otro puerto)
-	dotenv     → leer variables de entorno desde .env
-	nodemon    → reiniciar el servidor al guardar cambios
Con npm isntall @type se instalan tipos, es decir, 
Con npx tsc –init se crea la configuración de typescript: el archivo tsconfig.json creado hará de compilador. 

##
Creamos un fichero .env:
PORT=3000
DB_HOST=localhost  
DB_PORT=5432
DB_USER=postgre
DB_PASSWORD=**** 
DB_NAME=planifyesquema
JWT_SECRET=*******


Para poder levantar correctamente la API es necesario respetar la nomenclatura, utilizar el mismo nombre que la base de datos creada en PostgreSQL y, además, recordar la contraseña que usamos cuando cremamos nuestro usuario. Este fichero .env, al igual que dist/ y node_modules/ no se subirán a Git, por lo que creamos un fichero gitignore y lo añadimos en él. 
A continuación, creamos el fichero src/config/db.ts, que establecerá las relaciones con PostgreSQL:

```
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});
pool.connect((err, _client, release) => {
  if (err) { console.error('Error al conectar con PostgreSQL:', err.message); return; }
  console.log('Conexión a PostgreSQL establecida correctamente.');
  release();
});

```
### BACKEND CON ANGULAR
Comenzamos creando los **modelos**: user, schedule, time-entry, entiroment. Son la base de tipos que usarán todo lo demás. 
```
PS C:\Users\plope\OneDrive\tfm\planify-app\frontend\src\app> mkdir models
``` 
