<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar el repositorio 
2. Ejecutar el comando
```bash
yarn install
```
3. Tener Nest CLI instalado
```bash
npm i -g @nestjs/cli
```
4. Levantar la base de datos
```bash
docker-compose up -d
```

5. Clonar el archivo __.env.template__ y renombrar la copia a __.env__

6. Llenar las variables de entorno definidas en el __.env__

7. Ejecutar la aplicacion enf dev:
```bash
yarn start:dev
```

8. Poblar la base de datos con la peticion a la api en el siguiente endpoint
```bash
http://localhost:3000/api/seed
```

## Stack usado
* MongoDB
* Nest