
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