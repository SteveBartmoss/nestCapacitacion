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

## Inserccion de la informacion en la base de datos

Como ya tenemos configurada toda la conexion hacia la base de datos y las validaciones, podemos crear la informacion en base de datos de la siguiente manera

```ts
import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>

  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    const pokemon = await this.pokemonModel.create(createPokemonDto);

    return pokemon;

  }

}
```

En el service de pokemon, inyectamos el schema que ya habiamos configurado y como siempre la inyeccion de la dependencia la realizamos en el constructor pero hay que notar algo en el siguiente ejemplo

```ts
@Injectable()
export class PokemonService {

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>

  ){}

}
```

Al schema que pasamos al constructor le tenemos que agregar el decorador `@InjectModel(Pokemon.name)` ya que por defecto los schemas de pokemon no son inyectables, ademas de que debemos mandarle el name de la clase para que se pueda resolver la inyeccion del schema, por lo demas simplemente configuramos la inyeccion de la siguimente manera `private readonly pokemonModel: Model<Pokemon>` para despues realizar la insercion en la siguiente funcion

```ts
@Injectable()
export class PokemonService {

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    const pokemon = await this.pokemonModel.create(createPokemonDto);

    return pokemon;

  }

}
```

Es importante notar que el guardado en la base de datos es asyncrono y por eso debemos usar el await y resolver la promesa que nos devuelve

## Responde un error 

Cuando ocurre un error, por defecto nest arroja un error generico como 500 internar server error, ya que la capa de nest toma la excepcion y hace lo mejor que puede para regresar un error, pero se puede mandar un error mas util de la siguiente manera 

```ts
async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try{

      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error){
      console.log(error)

      throw new BadRequestException(`code: ${error.code} keyValue: ${JSON.stringify(error.keyValue) } message: ${error.errorResponse.errmsg} `)
    }

  }
```

De esta manera el bloque trycatch captura la exception de la inserccion a base de datos y regresamos el error para el usuario que es mas claro y permite identificar que es lo que salio mal 

## Buscar un pokemon por no, name o mongoId

ya que tenemos configurado el schema para la base de datos podemos usarlo para buscar dentro de la base de la siguiente manera

```ts
async findOne(term: string) {

    let pokemon: Pokemon | null = null;

      if(!isNaN(+term)){
        pokemon = await this.pokemonModel.findOne({no: term});

      }

      if(!pokemon && isValidObjectId(term)){
        pokemon = await this.pokemonModel.findById(term);
      }

      if (!pokemon){
        pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
      }

      if(!pokemon){
        throw new NotFoundException(`Pokemon with id, name or no "${term}" not found `)
      }

      return pokemon;
    
  }
```