
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



