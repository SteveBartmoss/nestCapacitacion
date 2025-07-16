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
      rootPath: join(__dirname, '..', 'public'),
    }),
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

  app.setGlobalPrefix('api');

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
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    PokemonModule,
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
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  imports: [
    MongooseModule.forFeature([
      {
        name: Pokemon.name,
        schema: PokemonSchema,
      },
    ]),
  ],
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
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

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
    private readonly pokemonModel: Model<Pokemon>,
  ) {}
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

## Actualizar un pokemon

Al igual que antes para actualizar un dato en la base podemo usar el modelo como se muestra a continuacion

```ts
async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try{

      await pokemon.updateOne(updatePokemonDto)

      return {...pokemon.toJSON(), ...updatePokemonDto}

    }catch(error){

      console.log(error)

      throw new BadRequestException(`code: ${error.code} keyValue: ${JSON.stringify(error.keyValue) } message: ${error.errorResponse.errmsg} `)
    }
  }
```

Se reutiliza el codigo para buscar un pokemon por name, mongoDb o no, tambien se manejo el error de una forma simple pero si se desea se puede implementar una funcion como la siguiente para capturar exceptiones sin repetir codigo

```ts
private handleExeptions(error: any){
    if(error.code === 1100){
      throw new BadRequestException(`Pokemon eixists in db ${JSON.stringify(error.keyValue)} `);
    }
    console.log(error);
    throw new InternalServerErrorException(`Cant create Pokemon - Check server logs`);
}
```

## Eliminar un pokemon

Nuevamente utilizamos el modelo para eliminar el registro de la base de datos como se puede mostrar en el siguiente ejemplo

```ts
  async remove(id: string) {

    //const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    //const result = await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if( deletedCount == 0){
      throw new BadRequestException(`Pokemon with id "${id}" not found`)
    }

    return `This action removes a id "${id}" pokemon`;

  }
```

Como se hizo antes, reutilizamos el codigo que ya creamos para evitar repetir codigo

## Custom pipe

Como no siempre existe un pipe de nest que permite validar que sea un mongoId valido pero podemos crear un customPipe por nuestra cuenta con el siguiente comando

```bash
nest g pi common/pipes/parseMongoId --no-spec
```

De esta forma nos crea el pipe en la carpeta `common/pipes` que es donde normalmente se colocan, el pipe quedaria con la siguiente forma

```ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid MongoID`);
    }

    return value;
  }
}
```

La mayoria del codigo fue generado por el comando, lo que podemos trabajar con el pipe es el value y la metadata, ambos valores tienen el siguiente aspecto

```ts
{
  value: '2',
  metadata: { metatype: [Function: String], type: 'param', data: 'id' }
}
```

En el value obtenemos el valor crudo del parametro de la ruta y en la metada data obtenemos diferente informacion, como tenemos el value solamente tenemos que validar que el value sea un mongoID valido como se hizo anteriormente

## Generar seed

Igual que en modulos anteriores vamos a crear un modulo de seed para llenar la base de datos en caso de no contar con algo en la base de datos. asi que podemos hacerlo con el comando 

```bash
nest g res seed --no-spec
```

Con esto se genera un resource llamado seed, del que solo necesitamos el module, controler y el service, lod otros elementos se pueden retirar y ademas solo necesitamos una ruta get y un metodo executeSeed en el service

## Inyecccion de dependencias

Como se realizo antes, podemos reutilizar el codigo de los servicios de pokemon para poder crear un pokemon, de esta forma podemos inyectar el metodo crear pokemon desde el servicio de la siguiente forma

```ts 
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';

@Injectable()
export class SeedService {

  constructor(
    private readonly pokemonService: PokemonService,
  ){}

  private readonly axios: AxiosInstance = axios;

  async executeSeed(){

    let pokeCreate = new CreatePokemonDto()

    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')

    data.results.forEach(async (element)=>{

      const segments = element.url.split('/');
      const no = +segments[segments.length-2]

      pokeCreate.name = element.name
      pokeCreate.no = no

      await this.pokemonService.create(pokeCreate)

    })

    return 'Seed Executed';

  }
}
```

De esta forma estamos inyectando la funcion del servicio pokemon en el servio de seed con las correspondientes exports e imports en los modulos

### pokemon.module

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
  ])],
  exports: [PokemonService],
})
export class PokemonModule {}
```


### seed.module

```ts
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from 'src/pokemon/pokemon.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [PokemonModule],
})
export class SeedModule {}
```

De esta forma podemos insertar en la base de datos, pero el curso esperaba una implementacion diferente que es la siguiente

```ts
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  private readonly axios: AxiosInstance = axios;

  async executeSeed(){

    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')

    data.results.forEach(async (element)=>{

      const segments = element.url.split('/');
      const no = +segments[segments.length-2]

      await this.pokemonModel.create({name: element.name, no})

    })

    return 'Seed Executed';

  }
}

```

En el curso inyectan un modelo que se usa para las insercciones en base de datos, creo que es debido a que muestran la forma de inyectar un modelo, cuando tenemos esta configuracion, igual debemos exportar el modelo en el `pokemon.module` de la siguiente manera

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
  ])],
  exports: [MongooseModule],
})
export class PokemonModule {}
```

De esta forma podemos hacer la inyeccion de la dependencia en el servicio del seed con la correspondiente importacion del `pokemon.module`

```ts
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from 'src/pokemon/pokemon.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [PokemonModule],
})
export class SeedModule {}
```

El codigo anterior permite la insercion en base de datos pero realiza una insercion en cada ciclo del for, y con la siguiente forma, todas las inserciones se hacen al mismo tiempo:

```ts
async executeSeed(){

    await this.pokemonModel.deleteMany({})

    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')

    const insertPromisesArray: Promise<any>[] = [];

    data.results.forEach((element)=>{

      const segments = element.url.split('/');
      const no = +segments[segments.length-2]

      insertPromisesArray.push(
        this.pokemonModel.create({name: element.name, no})
      );

    });

    await Promise.all(insertPromisesArray);

    return 'Seed Executed';

  }
```

De esta forma todas las promesas se resuelven al mismo tiempo en lugar de esta haciendo una promesa cada iteracion del for, pero aun existe una mejor alternativa y es la siguiente

```ts
async executeSeed(){

    await this.pokemonModel.deleteMany({})

    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    const pokemonToInsert: CreatePokemonDto[] = []

    data.results.forEach((element)=>{

      const segments = element.url.split('/');
      const no = +segments[segments.length-2]

      pokemonToInsert.push({name: element.name, no})

    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed';

  }
```

Con esta nueva forma le dejamos el trabajo de insercion directamentamente al gestor de la base de datos, esto es mas eficiente porque solo se arma el arreglo de objetos y despues se manda al gestor la informacion para que se almacene de una sola vez

## Custom provider

En el modulo de seed, se dejo la dependencia de la liberia de axios y esto no es una buena practica ya que si bien no se esta usando axios en ninguna otra parte del codigo no se deben dejar dependencias asi en los modulos porque eso daria muchos conflictos cuando se implemente en diferentes partes y se quiera dejar de usar axios o se cambie la forma en que se usa axios, por esta razon definimos una nueva `http-adapter-interface` y un nuevo `axios.adapter` que permitan quitar la dependencia directa con axios, el contenido seria el siguiente:

```ts
export interface HttpAdapter{
    get<T>(url: string): Promise<T>
}
```

En la interface simplemente definimos que cualquiera que extienda de la clase httpAdapter debe implementar la funcion `get()` con esto nos aseguramos que cualquier adaptador que extendia de esta interface implemente la misma funcion, ahora debemo implementar el adaptador para axios

```ts
import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AxiosAdapter implements HttpAdapter{
    private axios: AxiosInstance = axios;

    async get<T>(url: string): Promise<T>{
        try{
            const {data} = await this.axios.get<T>(url);
            return data;
        }catch(error){
            throw new Error('This is an error - Check logs');
        }
    }
}
```

De esta forma la dependencia de axios solo esta presente en este adaptador, tambiene extendemos la interface HttpAdapter y realizamos la implementacion de la funcion, aqui es donde colocamos la peticion por axios para recuperar la informacion de la api. Finalmente agregamos el decorador `@Injectable()` para hacer que este adaptador sea inyectable en el constructor donde queremos usar el adptadpr como se muestra a continuacion


### exportacion en el common modules

```ts
import { Module } from '@nestjs/common';
import { AxiosAdapter } from './adapters/axios.adapter';

@Module({
    providers: [AxiosAdapter],
    exports: [AxiosAdapter],
})
export class CommonModule {}
```


### importacion en seed module

```ts
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PokemonModule } from 'src/pokemon/pokemon.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [PokemonModule,CommonModule],
})
export class SeedModule {}
```