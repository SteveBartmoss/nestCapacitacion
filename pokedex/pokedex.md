## Servir contenido estatico

Podemos servir una pagina estatica de prueba en el proyecto de nest, si queremos mostrar alguna pagina de ayuda o simplemente algo de contenido 
cuando visitan la url en el navegador si instalamos el siguiente modulo con el comando

```bash
yarn add @nestjs/serve-static
```

Con el paquete agregado ahora debemos indicar el modulo principal que debe server el contenido estatico que tenemos en la carpeta public con la siguiente configuracion

```ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```


## Prepara api inicial

Para poder tener el esqueleto principal de la api sin tener que hacer todo manual, podemos crearla con el siguiente comando

```bash
nest g res pokemon --no-spec
```

## Prefix Global

Si queremos que las url de nuestra aplicacion siempre contengan algun prefijo, como por ejemplo `api/pro` podemos hacerlo con la siguiente configuracion del archivo main

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## Docker configuracion

Para manejar la imagen de mongoDB desde docker lo podemos hacer con el siguiente archivo de dockerCompose

```yaml
services:
  db:
    image: mongo:5
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGODB_DATABASE: nest-pokemon
    volumes:
      - ./mongo:/data/db
```

Cuando ya tenemos configurado el archivo yaml podemos levantar la instancia de la base de datos con el comando 


```bash
docker-compose up -d
```