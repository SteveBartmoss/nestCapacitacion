## Configurar el docker compose para la base de datos

Como ya se hizo en un curso anterior, podemos configurar un archivo de docker para levanta la base de datos de una forma simple, esto lo haremos con un archivo como el siguiente

```yaml
version: '3'

services:
  db:
    image: postgres:14.3
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    container_name: teslodb
    volumes:
      - ./postgres:/var/lib/postgresql/data
```

**Importante** Se debe tener un archivo **.env** para que tome las variables del nombre y el pasword de la base de datos, o en su defecto dejarlas escritas en el yaml

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
    ...TypeOrmModule.forRoot({
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

Seleccionamos **API rest** y y **Yes** para que se generen los puntos de entrada y podemos configurar el entity del producto como se ve a continuacion

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;
}
```

Con esto tenemos configurado el entity del producto pero ahora debemos importarlo en el archivo **product.module** para que sea reconocido por el ORM y se sincronice con la base de datos, para esto lo hacemos de la siguite manera

```ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [TypeOrmModule.forFeature([Product])],
})
export class ProductsModule {}
```

## Diferentes formas de declarar el entity

Como en muchos casos, existen diferentes formas de declarar las propiedades de una columna, a continuacion se ejemplifican algunas de estas formas

```ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    ...

    @Column('numeric',{
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    ...
}
```

## Instalar validaciones

Para poder validar de una forma simple la informacion envidada a la api debemos instalar lo siguiente

```bash
yarn add class-validator class-transformer
```

Cuando esten instalados los paquetes, debemos agregar la configuracion global de pipe

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);
```

## Configurar DTO

Como siempre debemos configurar el dto, una configuracion que me perecio nueva es la siguiente

```ts
export class CreateProductDto {

    ...
    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @IsIn(['men','women','kid','unisex'])
    gender: string;

}
```

## Patron repository en el servicio

El en curso se aconseja usar el patron de repositorio, con lo cual tenemos que realizar la siguiente configuracion

Inyectamos la dependencia del repositorio de producto que fue configurada por el typeORM, de esta forma creamos la dependencia del repositorio

```ts
@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
  ){}
  ...
}
```

Implementamos el uso del repository en el servicio

```ts
@Injectable()
export class ProductsService {
    ...
  async create(createProductDto: CreateProductDto) {

    try{

      const product = this.productRespository.create(createProductDto);
      await this.productRespository.save(product);
      return product;

    }catch(error){
      console.log(error)
      throw new InternalServerErrorException('Auxlio XD')
    }
  }

}
```

De esta forma es como si primero inicializamos el producto que queremos insertar en base de datos con la linea `const product = this.productRespository.create(createProductDto);` despues podemos simplemente crear el producto en base de datos con la siguiente linea `await this.productRespository.save(product);` con esto si se modifica la base de datos y tenemos creado el producto.

### Diferencia con la insercion a base de datos anterior

Anteriormente cuando queriamos insertar algo en base de datos lo hacemos de la siguiente manera

```ts
try {
  const pokemon = await this.pokemonModel.create(createPokemonDto);
} catch (error) {
    ...
}
```

En el que basicamente usamos el entity para la creacion en la base de datos y en el patron repository, primero instanciamos el repositorio y mediante las funciones del repositorio le pasamos un objeto que tiene la misma estructura de la entidad (el dto) y con eso se crea en la base de datos. En este nuevo patron el repositorio es el que manipula la base de datos y el entity simplemente define la estructura en la base de datos

## Manejo de errores

Para trabajar con los errores podemos definir una funcion que captura los errores y luego arroja la exception correspondiente o una exception por defecto en caso de que no tenga definido el codigo de error

```ts
try {
  ...
} catch (error) {
    this.handleExceptios(error)
}

private handleExceptios(error: any){
    if(error.code === '23505'){
        throw new BadRequestException(error.detail);
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
}
```


## Validacion BeforeInsert

Como uno de los campos de la base de datos, puede que exista o puede que no en la peticion, podemos realizar un metodo en el entity que realice alguna accion antes de insertar en la base de datos, esto se puede hacer de la siguiente forma

```ts
@Entity()
export class Product {
    ...
    @BeforeInsert()
    checkSlugInsert(){
        if(!this.slug){
            this.slug = this.title.toLocaleLowerCase().replaceAll(' ','_')
        }

        this.slug = this.slug.toLocaleLowerCase().replaceAll(' ','_')
    }

}
```

### Metodos interesantes del Repository

podemos buscar por condicion

```ts
const product = await this.productRespository.findOneBy({'id': id})
```

podemos remover por una entidad 

```ts
await this.productRespository.remove(product!)
```

podemos remover por el id

```ts
await this.productRespository.delete({'id': id})
```

## Pagination

Como se implemento en el anterior proyecto, definimos una pagination para que al leer todos lod productos no arroje toda la informacion de una sola vez, si no que muestre una cantidad determinada

Primero definimos un dto para la informacion de la paginacion

```ts
export class PaginationDto{

    @IsOptional()
    @IsPositive()
    @Type(()=>Number)
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type(()=>Number)
    offset?: number;
}
```

Luego pasamos el parametro en el __product.controller__ y lo trabajamos en el __product.servicio__

```ts
@Controller('products')
export class ProductsController {
    ...

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

}
```

```ts
@Injectable()
export class ProductsService {
    ...
  async findAll(paginationDto: PaginationDto) {
    try{
      const {limit = 10, offset = 0 } = paginationDto
      const productsList = await this.productRespository.find({
        take: limit,
        skip: offset
      });
      return productsList
    }catch(error){
      this.handleExceptios(error)
    }

  }
  ...
}
```

## Query Builder

Como se espera que se pueda buscar por uuid o por slug o title, debemos realizar alguns configuraciones diferentes, primero debemos instalar uuid con el siguiente comando

```bash
yarn add uuid @types/uuid 
```

Ya podemos realizar la correspondiente importacion y validacion para que el termino de busqueda sea un uuid

```ts
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

    ...
  async findOne(term: string) {

    try{

      let product: Product|null;

      if(isUUID(term)){
        product = await this.productRespository.findOneBy({id: term})
      }
      else{
        ...
      }

      if(!product){
        throw new NotFoundException(`Product whit id: ${term} not found`)
      }
      return product
    }catch(error){
      this.handleExceptios(error)
    }

  }
  ...
}
```

Para buscar por el titulo o e slug podemos utilizar un query builder como se muestra a continuacion

```ts
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

    ...
  async findOne(term: string) {

    try{

      let product: Product|null;

      if(isUUID(term)){
        ...
      }
      else{
        const queryBuilder = this.productRespository.createQueryBuilder();
        product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`,{
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        }).getOne();
      }

      if(!product){
        throw new NotFoundException(`Product whit id: ${term} not found`)
      }
      return product
    }catch(error){
      this.handleExceptios(error)
    }

  }
  ...
}
```

Con esto se configura la busqueda por el titulo o por el slug en la base de datos, una definicion de query builder bastantes rara y por primera vez me parece mejor la eloquent (jamas pense que esto pasaria) pero bueno si ya se esta usanto ts que se puede esperar

## Actualizar un producto

A difenrencia de los query builder, la forma de actualizar un producto mediante el patron repository es mejor que los modelos de eloquent, en este caso tenemos que hacer algo como esto

```ts
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

    ...
  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRespository.preload({
      id: id,
      ...updateProductDto
    });

    if(!product){
      throw new NotFoundException(`Product with id: ${id} not found`)
    } 
    
    try{
      return await this.productRespository.save(product);
    }catch(error){
      this.handleExceptios(error)
    }
    
  }
  ...
}
```

En este caso tenemos un metodo llamado __preload__ que es como un metodo que recupera una fila de la base de datos que se quiere actulizar y al mismo tiempo se esparce la informacion que se quiere actualizar, esto ultimo no es gracias a typeORM, si no a que trabajaca con objetos y lo que hace es que espacirmos las propiedades del dto para actualizar, de esta forma no importa que campos mandamos y cuales no, simplemente se esparcen los cmapos que estan presentes en el dto.

Finalmente cuando tenemos los campos esparcidos solo tenemos que usar el metodo __save__ y pasarle el producto o regirstro que queremos guardar

## BeforeUpdate 

Al igual que se trabajo en el momento de crear el producto, podemos validar al momento de actualizar dentro del entity de la siguiente forma

```ts
@Entity()
export class Product {

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLocaleLowerCase().replaceAll(' ','_')
    }

}
```