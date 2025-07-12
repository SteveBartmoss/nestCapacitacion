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

## Conectar nest con mongo

Para realizar la conexion debemos instalar el paquete de nest que permite conectarse a mongo con el siguiente comando

```bash
yarn add @nestjs/mongoose mongoose
```

ya que tenemos instalado el comando podemos realizar la conexion en el archivo de `app.module` de la siguiente manera

```ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    PokemonModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Con esto logramos hacer la conexion a la base de datos que se configuro en el mismo proyecto

## Configurar el schema para la DB

Cuando se trabaja con la base de datos como puede ser mongo, debemos configurar el schema para poder indicar que estructura tendra la informacion que se guarda en la base de datos, para lograr esto debemos hacerlo en archivo `pokemon.entity.ts` que debe estar en la carpeta entities que nos genera nest si usamos el comando resource, el archivo deberia queda como el siguiente ejemplo

```ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Pokemon extends Document {

    @Prop({
        unique: true,
        index: true,
    })
    name: string;
    @Prop({
        unique: true,
        index: true,
    })
    no: number;

}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

```

Primero es importante notar que el archivo contiene el decorador `@Schema()` el cual indica que se trata de una clase que trabaja con la base de datos, tambien se debe notar que el archivo extiende de `Document` que proviene del paquete que antes se instalo mongoose. Dentro de la clase se define la estructrua que tendra la informacio guardada como el nombre o el numero de pokemon, pero ademas con el decorador `@Prop({unique: true,index: true,})` le indicamos a la base de datos que el campo es unico y que debe ser manejado como indice, nuevamente el decorador viene de los paquetes instalados previamente. Por ultimo debemos exponer el schema con la exportacion del mismo de la siguiente manera `export const PokemonSchema = SchemaFactory.createForClass(Pokemon);`

### Realizar la conexion del schema con mongo

Ya que se tiene configurado el schema se debe agregar a la configuracion de mongoose para que se pueda hacer la inserccion de datos a la base de datos posteriormente, esto lo hacemos en la configuracion del archivo `pokemon.module.ts`

```ts
import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [MongooseModule.forFeature([
    {
      name: Pokemon.name,
      schema: PokemonSchema,
    } 
  ])]
})
export class PokemonModule {}
```

En este archivo debemos hacer la carga del schema y de la entidad en la siguiente linea `imports: [MongooseModule.forFeature([{name: Pokemon.name, schema: PokemonSchema,} ])]` realizando las importaciones correspondientes del archivo entity, con esto le indicamos a la base de donde tomar la configuracion del schema

