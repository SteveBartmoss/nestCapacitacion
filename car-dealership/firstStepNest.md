# Instalar Nest cli

Para instalar la cli de nest y poder utilizar los diferentes comando se puede usar el siguiente comando

```bash
npm i -g @nestjs/cli
```

Esto nos dara de manera global la consola de nest y podremos usar otros comando utiles para trabajar con nest

## Crear proyecto desde nest cli

Para crear un proyecto con la herramienta que instalamos podemos usar el siguiente comando

```bash
nest new project-name
```

De esta manera se creara un proyecto con el ambiente necesario para trabajar con nest en la carpeta con el mismo nombre, para poder levantar el proyecto que se creo podemos usar los siguientes comandos

```bash
# nos movemos a la carpeta del proyecto que se creo
cd project-name
# ejecutamos el proyecto en desarrollo
yarn start:dev
```

## Explicacion de archivos

**.eslintrc.js**

Es el archivo de configuracion del linker, contiene recomendaciones para seguir las buenas practicas de nest

**.gitignore**

Este archivo permite ignorar archivos que no son necesarios subir al repositorios, como por ejemplo nos node modules que se pueden recontruir desde el package.json o el yarn.lock

**.prettierrc**

Es otro archivo de configuracion que nos permite la deteccion de errores sobre malas practicas al momento de codificar

**nest-cli.json**

Contiene la configuracion del cli de nest, es muy raro que se tenga que modificar y viene configurada al momento de inicilizar el proyecto

**package.json**

Este archivo contiene informacion sobre el proyecto, como el autor, versiones, y tambien configuracion del mismo proyecto como scripts, dependencias entre otras configuraciones del proyecto.

**README**

Contiene informacion para ejecutar el proyecto o como se pueda usar el proyecto, esto en general es una ayuda para otros desarrolladores o usuarios

**tsconfig.json**

Es un archivo que contiene la configuracion para las traspilacion de ts, esta configuracion no es muy comun ya que viene configurada desde el inicio con la recomendada

### dist

Esta carpeta contiene todos los archivos de la version de produccion de la aplicacion

### node_modules

Esta carpeta contiene librerias externas del proyecto, no se suele modificar ya que el mismo archivo de dependencias se encarga de manejarla

## Modulos

Agrupan y desacoplan un conjunto de funcionalidad especifica por dominio, por ejemplo auth.modules.ts, estaria encargado de todo lo relacionado a la autenticacion. Se puede pensar en un modulo como un subproyecto que esta acargo de toda la logica una parte del negocio, por ejemplo un modulo podria ser de clientes. El app.module.ts es el modulo raiz que se encarga de contener todos los demas modulos que podrian ser considerados como modulos hijos, este modulo riaz es llamado en el archivo main del proyecto que es el punto de entrada de todo el proyecto.

Para crear un modulo se pueda usar el siguiente comando

```bash
nest g mo nombreModulo 
```

## Controladores

Este apartado controla las rutas de la aplicacion, son los encargados de escuchar una solicitud y emitir una respueta a esa peticion, por ejemplo un controlador tendria las rutas necesarias para un crud. 

Para crear un controlador se pueda usar el siguiente comando

```bash
nest g co nombreControlador
```
