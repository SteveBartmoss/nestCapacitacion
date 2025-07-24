
## Endpoint para subir archivos

Lo primero que tenemos que hacer es crear un nuevo resource para el endpoint de subir archivos con el siguiente comando

```bash
nest g res files
```

Despues de ejecutar el comando, podemos remover archivos que no son requeridos para el endpoint, por ejemplo los dtos o los entities

### Instalar los tipos necesarios

```bash
yarn add @types/multer
```

## Recibir el archivo en el endpoint 

Para poder trabajar con un archivo desde el controlador de nest tenemos que hacer lo siguiente

```ts
...
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    return file;
  }
}
```

En el endpoint para el file product definimos el pipe `@UploadFile` y tambien definimos que sera de tipo `file: Express.Multer.File` que son los tipos de que se instalaron con el comando anterior

### Configurar interceptor

Aun cuando definimos el archivo con el pipe y el tipo de dato desde multer, por si solo no es capas de acceder al archivo se tiene que declarar un `interceptor` para poder acceder al valor del form data que se esta enviando al endpoint, se configura de al siguiente manera

```ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    return file;
  }
}
```

De esta forma definimos en el interceptor el key del campo que representa el archivo al momento de obtener el form data, en este caso se maneja como 'file'


## Validacion del archivo

Mediante el uso del interceptor, podemos realizar una validacion del archivo, antes de que sea procesado por el controlador, esto es porque en el ciclo de vida un interceptor se ejecuta antes de que la peticion llegue al controlador, de esta forma podemos hacer validaciones basicas antes de que el archivo llegue al service que es donde se utiliza la logica del backend

```ts
...
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {fileFilter: FileFilter}))
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    return file;
  }
}
```

La connfiguracion del interceptor se muestra a continuacion

```ts
import { Request } from "express";

export const FileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {

    if(!file) return callback( new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1]
    const validExtensions = ['jpg','jpeg','png','gif'];

    if(!validExtensions.includes(fileExtension)){
        return callback(null, false)
    }
   
    callback(null, true);

}
```

Con la configuracion anterior estamos manejando el error de que el archivo no exista o que no sea de un tipo valido, pero se podria validar tambien que el peso no supere cierta cantidad, y en general validaciones basicas para que el archivo no sea procesado en la parte logica del backend

## Subida automatica con el interceptor

Mediante el uso del interceptor, podemos subir automaticamente el archivo si se configura el parametro `destination`, de esta forma quedaria la configuracion

```ts
...
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {fileFilter: FileFilter,
    storage: diskStorage({
      destination: './static/uploads'
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    return file;
  }
}
```

De esta forma el storage queda configurado para la ruta que especificamos y directamente al procesar el archivo en el interceptor se envia a la carpeta configurada


## Renombrar el archivo que se almacena

Al igual que la funcion que pasamos para las validaciones del tipo de archivo, tambien podemos usar una funcion para renombrar el archivo que esta subiendo. Por lo tanto debemos crear un nuevo archivo en la carpeta helpers que se llama `fileNamer.helper` que tendra la siguiente estructura

```ts
import { v4 as uuid } from "uuid";

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `${uuid()}.${fileExtension}`;

    callback(null, fileName);
}
```

El contenido es muy parecido a la funcion que se declaro para los filtros de los archivos, en este caso tambien recibe el request, el file y al final pasamos el callback que es lo que se ejecuta cuando terminamos de hacer el proceso de renombrar el archivo

En el curso colamos el nombre tomando la extension del archivo original pero le agregamos un identificador unico con la libreria uuid, de esta forma nos aseguramos de que los archivos no sean reemplazados

Si no se cuenta aun con la liberia de uuid se puede instalar con el siguiente comando 

```bash 
yarn add uuid
```

## Servir archivos de manera controlada

Ya que se configuro la forma para subir archivos a una carpeta estatica de url, debemos configurar una funcion para poder servir el archivo mediante un endpoint ya que de esta forma podemos mandar imagenes que se utilizan como cualquier otra imagen, para esto tenemos que configurar el siguiente endpoint para el `files.controller`

```ts
...
import { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('product/:imageName')
  findProductImage(@Res() res: Response, @Param('imageName') imageName: string){
    const path = this.filesService.getStaticProductImage(imageName)
    res.sendFile(path)
  }
  
}
```

Definimos un metodo GET para la ruta files y en e, que recibiremos un param con el nombre de la imagen que queremos buscar, como el controlador no tiene que llevar mucha logica se deja la funcion para armar la ruta de los archivos al `files.service`

```ts
...
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    getStaticProductImage(imageName: string){
        const path = join(__dirname, '../../static/products',imageName)
        if(!existsSync(path)){
            throw new BadRequestException(`No product found with image ${imageName}`)
        }
        return path;
    } 
}
```

Dentro del servicio utilizamos funciones del file system de nodejs, con la funcion `join()` armamos la ruta del archivo que estamos buscando, con la funcion `existsSync` verificamos que el archivo existe y si no existe mandamos una exception de que no se encontro la imagen

Finalmente en el controlador podemos servir la imagen de la siguiente forma

```ts
@Get('product/:imageName')
  findProductImage(@Res() res: Response, @Param('imageName') imageName: string){

    const path = this.filesService.getStaticProductImage(imageName)

    res.sendFile(path)
}
```

Utilizamos un decorador que pertenece a express, y mediante la funcion response que llamamos desde la misma response que estamos usando desde express, obtenemos el path con la funcion que definimos en el servicio y con la funcion 
`sendFile` servimos el archivo para el cliente

**Importante** el decorador `@Res() res: Response` rompe el ciclo de nest, esto quiere decir que interceptor que estamos usando o algunas funciones de nest pueden dejar de funcionar, ya que nest esta construido sobre express asi que se tiene que tomar en cuenta esto al momento de usar el decorador

## Regresar el url de la image

Cuando subimos una imagen al sistema podemos regresar el url para la peticion de la imagen que servimos de manera estatica, para esto simplemente tenemos que definir una variable en el .env para poder armar el url que se usaria para mandar una peticion por el archivo estatico

```ts
DB_PASSWORD=holastalker
DB_NAME=tesloDB
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres

PORT=3000
HOST_API=http://localhost:3000/api
```

Con la configuracion de la variable del .env, podemos armar el url que se require para servir el archivo de manera estatica usando la variable que esta dentro del .env como se muestra a continuacion

```ts
...
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    ...
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {fileFilter: FileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUlr = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUlr
    };
  }
}
```

Para poder utilizar el `configService` esta siendo inyectado asi que debemos importar el ConfigService para poder resolver la inyeccion del configService

```ts
...
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    ConfigModule
  ]
})
export class FilesModule {}
```

## Forma alternativa de servir archivos

Si bien se configuro la aplicacion para tener un endpoint que recibe imagenes y que ademas puede servir las imagenes pero existe una alternativa para poder servir imagenes de los productos de forma estatica, para esto debemos instalar un paquete para nest con e siguiente comando

```bash 
yarn add @nestjs/serve-static
```

Con este paquete podemos configurar una carpeta public que sera servida de forma estatica para que las imagenes se puedan resolver con la siguiente configuracion

```ts
...
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST!,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,  
  ],
})
export class AppModule {}
```

Con la configuracion anterior podemos obtener la imagen desde el navegador o de una peticion get de la siguien manera `http://localhost:3000/products/1473809-00-A_1_2000.jpg`