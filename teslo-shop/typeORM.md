## Configurar el docker compose para la base de datos

Como ya se hizo en un curso anterior, podemos configurar un archivo de docker para levanta la base de datos de una forma simple, esto lo haremos con un archivo como el siguiente

```yaml
version: '3'

services:
  db:
    image: postgres:14.3
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    container_name: teslodb
    volumes:
      - ./postgres:/var/lib/postgresql/data
```

**Importante** Se debe tener un archivi __.env__ para que tome las variables del nombre y el pasword de la base de datos, o en su defecto dejarlas escritas en el yaml

## Configurar variables de entorno

Para poder configurar las variables de entorno tenemos que realizar primero la instalacion del siguiente paquete

```bash
yarn add @nestjs/config
```

Luego de la instalacion tenemos que importarlo el archivo `app.module` de la siguiente manera

```ts
...
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
```

## Conectar postgres con nest

Para realizar la conexion a la base de datos de postgres tenemos que realizar la siguiente instalacion de paquetes


```bash
yarn add @nestjs/typeorm typeorm pg
```

Luego de esto tenemos que realizar la conexion a la base de datos como se muestra a continuacion

```ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ...
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
  ],
})
export class AppModule {}
```

Con esto tenemos configurada la conexion hacia postgres

## Crear endpoint para productos

Pata tener el esqueleto de la base del modulo de productos, podemos usar el siguiente comando 

```bash
nest g res products --no-spec
```

Seleccionamos __API rest__ y y __Yes__ para que se generen los puntos de entrada y podemos configurar el entity del producto como se ve a continuacion

```ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true,
    })
    title: string;
    
}
```

Con esto tenemos configurado el entity del producto pero ahora debemos importarlo en el archivo __product.module__ para que sea reconocido por el ORM y se sincronice con la base de datos, para esto lo hacemos de la siguite manera

```ts
...
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product])
  ]
})
export class ProductsModule {}
```