## Configurar variables de entorno 

Esta configuracion la realizamos en el archivo `.env` que tambien suele esta en el archivo `.gitignore` porque no queremos que se suba al repositorio. Para poder usar un archivo de env en nest debemos instalar el siguiente paquete 

```bash
yarn add @nestjs/config
```

Cuando la instalacion finalice debemos importar la libreria en el archivo `app.module` como se muestra a continuacion

```ts
@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### Configurar loader

Puede que el usuario no configure su `.env` y para esto podemos configurar un loader como se muestra a continuacion, la ruta suele ser `pokedex/src/config/app.config.ts`

```ts
export const EnvConfiguration = () =>({
    environment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONGODB || 'mongodb://localhost:27017/nest-pokemon',
    port: process.env.PORT || 3001,
    defaultlimit: process.env.DEFAULT_LIMIT || 7
})
```

En el archivo anterior estamos especificando que tome los valores del .env y si no estan definidos les asigna un valor por defecto, esto ayuda en caso de que no se defina nada en el .env y ya solo basta agregarlo a la configuracion de `app.module`


```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB'),
      }),
    }),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

**Importante** como se le agrega al configuracion module la bandera `isGlobal: true,` no es necesario importar el configuracion module en ningun lado ya que se usa de manera global. 

Como ya tenemos configurado el loader ahora podemos usar los valores en el pokemon service para que por defecto use un limite diferente en la paginacion de los pokemos, esto se logra con la siguiente configuracion

```ts
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService

  ){
    this.defaultLimit = configService.get<number>('defaultLimit') as number
  }

  async findAll(paginationDto: PaginationDto) {

    const {limit = this.defaultLimit, offset = 0 } = paginationDto;
    
    return await this.pokemonModel.find().limit(limit).skip(offset).sort({no: 1}).select('-__v')

  }
  ...
}
```

Con lo anterior ya podemos usar sin problemas un limite por defecto que viene configurado en el env o en su defecto el valor que viene en el loader

## Joi Schema validation

Aunque la configuracion que tenemos suele ser suficiente, puede que queramos que la aplicacion de excepciones si no esta configurado algo importante como la ruta de conexion a base de datos o el puerto de la aplicacion. Para esto podemos usar un paquete llamado para `join` que se puede instalar de la siguiente manera

```bash
yarn add joi
```

Ya que tenemos instalado el paquete, podemos trabajar con la misma para poder hacer las validaciones de las variables del .env ya que puede que aun necesitamos algo mas estricto, por lo tanto podemos declarar un validation schema como el siguiente

```ts
import * as Joi from "joi";

export const JoiValidationSchema = Joi.object({
    MONGODB: Joi.required(),
    PORT: Joi.number().default(3005),
    DEFAULT_LIMIT: Joi.number().default(6),
})
```

Con esto creamos un schema que se validara al momento de leer las variables del .env y ya podemos insertarlo en el `app.module` como se muestra a continuacion

```ts
...
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 
```

Con esto tenemos una validacion extra para los casos en que no se definen las variables del .env

## Template para el .evn

El arhivo .env real no suele subirse a github ya que este tiene configuraciones sensibles como pueden ser tokens, passwords o algo que no se quiere revelar a la personas asi que podemos subir un template en el que dejamos datos de muestra o que no comprometen la seguridad del proyecto

```ts
MONGODB=mongodb://localhost:27017/nest-pokemon
PORT=3000
DEFAULT_LIMIT=5 
```

### Opiciones para manejar la base de datos

- Railway
- MongoDB Atlas


Cuando trabajemos con la base de datos remota podemos usar lo siguiente para configurar el nombre de la base de datos

```ts

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    MongooseModule.forRoot(process.env.MONGODB, {
      dbName: 'pokemondb'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    PokemonModule,
    CommonModule,
    SeedModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 
```

## Configuracion de la aplicacion para el despliegue en la nube

Debemos realizar un cambio el package.json

```ts
{
  "scripts": {
    "start": "node dist/main",
    "start:prod": "nest start",
  }, 
} 
```

Debemos intercambiar los valores de los scripts `start` y `start:prod` siguiendo este orden `start` -> `start:prod` y `start:prod`->`start`

Tambien debemo segurarnos que en el archivo main.js estemos usando la siguiente configuracion

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(...)
  await app.listen(process.env.PORT);
}
bootstrap();
```

Ya que el puerto lo asignara el host al que subimos el proyecto

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(...)
  await app.listen(process.env.PORT);
}
bootstrap();
```

## Dockerizar aplicacion

Para esto debemos configurar un dockerFile como el siguiente

```ts
FROM node:18-alpine3.15

# Set working directory
RUN mkdir -p /var/www/pokedex
WORKDIR /var/www/pokedex


# Copiar el directorio y su contenido
COPY ../var/www/pokedex
COPY packaged.json tsconfig.json tsconfig.build.json /var/www/pokedex/
RUN yarn install --prod
RUN yarn build

# Dar permiso para ejecutar la applicacion
RUN adduser --disabled-password pokeuser
RUN chown -R pokeuser:pokeuser /var/www/pokedex
USER pokeuser

# Limpiar el cache
RUN yarn cache clean --force

EXPOSE 3000

CMD ["yarn","start"]
```

Esto es una configuracion simple y reducida de lo que debe tener un dockerfile