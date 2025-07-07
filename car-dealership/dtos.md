# Interfaces en endpoints

Una forma de mantener la consistencia de la informacion que espera obtener al momento de recibir informacion en el backend de nest, es mediante el uso de una interface.


```ts
export interface Car{

    id: string; 
    brand: string;
    model: string;
    
}
```

De esta forma tenemos la definicion de lo que esperamos recibir en el endpoint

### Libreria uuid

Esta libreria nos permite asignar id unicos a para cada elemento que recibimos y la podemos instalar con el siguiente comando


```bash
yarn add uuid
```

## Custom pipe para uuid

De manera predeterminada nest incorpora un pipe para el tipo de datos uuid, la forma de implementarlo es la siguiente


```ts
@Get(':id')
getCarById( @Param('id', ParseUUIDPipe) id){
    return this.carsService.findById(id);
}
```

# Data transfer Object

Un objeto de transferencia de datos que maneja la estructura de la informacion que se recobre en un endpoint de tipo post, por temas de validaciones y quizas algun que otro problema que el mismo ts crea, los dto siempre son clases. Para este ejemplo el dto tiene la siguiente forma

```ts
export class CreateCarDto{

    readonly brand: string;
    readonly model: string;
    
}
```

Ahora que tenemos definido el dto, debemos aplicarlo al endpoint que recibira la informacion que en este caso es un ponst y se realiza de la siguiente manera

```ts
@Post()
createCar(@Body() createCarDto: CreateCarDto){
    return createCarDto;
}
```

# Validation pipe

Cuando implementamos un dto no es suficiente para validar que la informacion siga la estructura, pues si bien tenemos definida la estructura no tenemos establecido que se valide el dto que usamos asi que debemos utilizr el validation pipe

```ts
@Post()
@UsePipes(ValidationPipe)
createCar(@Body() createCarDto: CreateCarDto){
    return createCarDto;
}
```

Cuando implementamos este validation pipe nos da un error y eso es porque necesitamos instalar los paquete adicionales de class-validator class-transformer, porque esto no viene de serie en nest, bueno no lo se quizas es parte de la magia de la programacion. Para instalar los paquetes debemos usar el siguiente comando 

```bash
yarn add class-validator class-transformer
```

Con los paquetes instalados ahora podemos decorar el dto para que surta efecto la validacion del mismo y quedaria de la siguiente manera


```ts
import { IsString } from "class-validator";

export class CreateCarDto{

    @IsString()
    readonly brand: string;
    
    @IsString()
    readonly model: string;

}
```

## Pipe global para la aplicacion

Como se vio en la pate anterior, se puede agregar la valicadion del pipe en el metodo de post pero los pipes se pueden aplicar a diferentes niveles de la aplicacion asi que podemos aplicar el pipe desde la rais de la aplicacion para que todos los metodos de la aplicacion hagan uso de las validacion al aplicarlo de la siguiente manera


```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Aqui podemos hacer dos anotaciones y es que al validacion pipe se le estan mandando dos parametros, que son whitelist y forbidNonWhitelisted que ahora hare una descripcion de cada uno.

**whitelist**

Esto hace que en el endpoint que recibe un body y que por ende esta usando un dto, solo acceda a los campos definidos, en este caso se definio que el dto del carro solo tiene model y brand, si mandamos un json con algun otro campo, solo se tomaran en cuenta los modelos definidos en el dto.

**forbidNonWhitelisted**

Esto cambia un poco el comportamiento anteriormente definido y es que ahora no solo no tomara en cuenta cuando se envian mas campos que los que estan definidos en un dto, si no que ademas mandara un exception para indicar que no se espera mas campos.

