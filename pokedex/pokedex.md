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
