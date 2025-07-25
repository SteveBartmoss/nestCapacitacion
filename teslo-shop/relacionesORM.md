
## Agregar nueva tabla

Para agregar una tabla que contenga las imagenes relacionadas con los produtos debemos definir una nueva entity que no es necesario tenerla en su modulo separado si no que podemos definirlo en el mismo aparado de entidades del producto, ente archivo tendria la siguiente estructura

```ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductImage{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;
    
}
```

Ya que tenemos la entidad creada, debemos agregarla al archivo _produts.moduel__ para que se pueda sincronizar correctamente con la base de datos

```ts
...
import { ProductImage } from './entities/product-image.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product,ProductImage])
  ]
})
export class ProductsModule {}
```

## Relacione entre tablas

Para genera relaciones entre la tabla de de productos y la nueva tabla de productsImages tenemos que declarar la relacion entre ambas tablas de la siguiente manera

En __product.entity__ definimos la relacion con la tabla de imagenes como se muesta a continuacion

```ts
import { ProductImage } from "./product-image.entity";

@Entity()
export class Product {
    ...
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        {cascade: true}
    )
    images?: ProductImage;
    ...
}
```

En el entity de productos, se define un nuevo campo que no sera una columna si no que representara una relacion uno a muchos (OneToMany) ya que un producto puede tener muchas imagenes, esta realcion lo primero que recibe es un call back del tipo que representara la relacion, en este caso es del tipo ProductImage entity, tambien tenemos que definir un segundo callback en el que relacionamos una instacion de la entidad y en la que indicamos el campo con el que se relaciona, en este caso es el product de la entidad productImage. 

En __product-image__ definimos la misma relacion pera en un sentido inverso como se muestra a continuacion

```ts
import { Product } from "./product.entity";


@Entity()
export class ProductImage{
    ...
    @ManyToOne(
        ()=> Product,
        (product) => product.images
    )
    product: Product;

}
```

En este caso la relacion es muchos a uno (manytoone) ya que muchas fotos pueden tener el mismo producto, al igual que antes la relacion lo primero que recibe es un callback que indica la entidad con la que tendra la relacion, en este caso Product, lo segundo es un callback que toma una instancia de la entidad relacionada y el campo de esa entidad para usar como relacion, en este caso es images de la entidad product

Con esto ya tenemos relacionada la tabla de product-images con la tabla de products

## Creacion de un producto con imagenes

Como la creacion de una imagen era muy simple al no tener que pasar mas que un paremetro, cuando agregamos el arreglo de las imagenes tenemos que modificar la funcion de creacion de la siguiente manera

```ts
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>

  ){}

  async create(createProductDto: CreateProductDto) {

    try{

      const {images = [], ...productDetails} = createProductDto;
      const product = this.productRespository.create({
        ...productDetails, 
        images: images.map(image => this.productImageRepository.create({url: image}))
      });

      await this.productRespository.save(product);
      return {...product,images: images};

    }catch(error){
      this.handleExceptios(error)
    }
  }

}
```

Primero inyectamos el repositorio de las imagenes, para poder manipular la base de datos con el mismo patron. Despues en la funcion de crear producto desestructuramos las imagenes y las propiedades de __createProductDto__ y dentro de la funcion `create` del repository de la images, se emplea una funcion map para que por cada elemento de las imagenes se cree una instancia en basde datos de a imagen y se le asigna el id del producto que se esta creando. Finalmente se usa la funcion del save del repositorio de productos para guardar todo en base de datos

## Obtener las imagenes al buscar productos o un producto

Como se agrego la relacion y se implemento para crear las relaciones al guardar a un producto, tenemos que especificar que al recuperar un prodcuto, tambien te de las imagenes, a continuacion se muestra como hacer esto


```ts
@Injectable()
export class ProductsService {
    ...
    async findAll(paginationDto: PaginationDto) {
    try{
      const {limit = 10, offset = 0 } = paginationDto
      const productsList = await this.productRespository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      });
      return productsList.map(({images, ...rest}) => ({
        ...rest,
        images: images?.map( img => img.url)
      }))
    }catch(error){
      this.handleExceptios(error)
    }

  }
  ...
}
```

En el caso de obtener todos los productos simplemente tenemosque agregar el atributo `relations: { images: true,}` que indica que activamos las relacionses con las images, para la busqueda por un titulo, slug o el id es un poco mas complejo

```ts
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
            const queryBuilder = this.productRespository.createQueryBuilder('prod');
            product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`,{
            title: term.toUpperCase(),
            slug: term.toLocaleLowerCase(),
            }).leftJoinAndSelect('prod.images','prodImages').getOne();
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

Para el caso en el que se utiliza una funcion de tipo `find*` simplemente tenemos que habilitar el parametro `eager` en el entity del producto

```ts
@Entity()
export class Product {

    ...
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];
    ...

}
```

Para el caso en que tenemos que utilizar un query builder tenemos que hacer una configuracion diferente, como se muestra a continuacion

```ts
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
            const queryBuilder = this.productRespository.createQueryBuilder('prod');
            product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`,{
            title: term.toUpperCase(),
            slug: term.toLocaleLowerCase(),
            }).leftJoinAndSelect('prod.images','prodImages').getOne();
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

En el caso del query builder, tenemos que usar la funcion `leftJoinAndSelect` en el que especificamos un alias para la tabla de prodcutos y despues en la funcion se espcifica el campo que queremos relacionar y el alias de la tabla con la que se relaciona

**Importante** Como en el caso de las imagenes se quiere que simplemente se retorne el url de la imagen se implementoi una segunda funcion para hacer esto en el caso de buscar un solo producto ya que si se modifica la funcion, se afectan otras funciones que la estan usando internamente

```ts
@Injectable()
export class ProductsService {
    ...
    async finOnePlain(term: string){
        const {images = [], ...rest } = (await this.findOne(term))!;
        return {
        ...rest,
        images: images.map(image => image.url)
        }
    }
    ...
}
```

Con esto cambiamos la funcion que se llama en controlador ya que se tiene que llamar esta funcion intermediaria

## Querry Runner

Como se agrego un campo en forma de relacion para las imagenes, tenemos que modificar el proceso de actualizacion, de esta forma tenemos que realizar lo siguiente

```ts
@Injectable()
export class ProductsService {
    ...
  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ){}
  ...
}
```

primero creamon una nueva instancia de un datasource, que es un objeto que nos permite establecer conexion con base de datos, iniciar y completar transacciones y en general realizar modificaciones a la base de datos pero de una forma mas ordenada y segura. Despues realizamos la modificacion en el metodo para la actualizacion como se muestra a continuacion

```ts
@Injectable()
export class ProductsService {

    ...
    async update(id: string, updateProductDto: UpdateProductDto) {

        const {images, ...toUpdate} = updateProductDto;

        const product = await this.productRespository.preload({
        id: id,
        ...toUpdate,
        });

        if(!product){
        throw new NotFoundException(`Product with id: ${id} not found`)
        } 

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction()
        
        try{

        if(images){
            await queryRunner.manager.delete( ProductImage,{product: {id}})

            product.images = images.map(image => this.productImageRepository.create({url: image}))
        } 

        await queryRunner.manager.save(product)
        await queryRunner.commitTransaction()
        await queryRunner.release()
        
        return this.finOnePlain(id);
        
        }catch(error){
        await queryRunner.rollbackTransaction();
        this.handleExceptios(error)
        }
    
  }

}
```

Primero creamos una instancia del queryRunnerm, iniciamosla conexion a la base de datos y tambien iniciamos la transaccion de la base de datos, depues de esto realizamos el siguiente codigo

```ts
@Injectable()
export class ProductsService {

    ...
    async update(id: string, updateProductDto: UpdateProductDto) {
        ...
        try{

            if(images){
                await queryRunner.manager.delete( ProductImage,{product: {id}})

                product.images = images.map(image => this.productImageRepository.create({url: image}))
            } 

            await queryRunner.manager.save(product)
            await queryRunner.commitTransaction()
            await queryRunner.release()
            
            return this.finOnePlain(id);
        
        }catch(error){
            await queryRunner.rollbackTransaction();
            this.handleExceptios(error)
        }
    
  }

}
```

De esta forma revisamos si las imagenes contiene algo y ejecutamos el proceso de eliminacion de las imagenes que tienen asigando el producto que se esta actualizando, despues realizamos el guardado del producto y si no existe error tambien de hace el commit de la transaccion y la desconexion a la base de datos, en caso de que ocurra un error, regresamos la transccition para evitar elimninar informacion en caso de un error

## Eliminacion en cascada

Como tenemos una relacion de los productos con las imagenes no se puede eliminar un producto que tiene asignada una imagen ya que la relacion es un constraint pero podemos solucionar eso con una simple modificacion en el entity de las imagenes

```ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity()
export class ProductImage{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        ()=> Product,
        (product) => product.images,
        {onDelete: 'CASCADE'}
    )
    product: Product;

}
```

Dentro de la relacion definimos la propiedad `onDelete: 'CASCADE'` que indica a la base de datos que cuando se borra un prodcuto se tiene que eliminar tambien todas las imagenes que estan asignadas al producto.


## Seed de los productos

Para crear el seed de los prodcutos se pueden seguir esta lista de pasos 

1. crear un nuevo modulo con el siguiten comando y despues borrar los elementos que no son necesarios

```bash
nest g res seed --no-spec
```

2. Realizar la inyeccion del `product.service` en el modulo de seed, esto con la devida exportaccion e importacion del servicio

3. Realizar la funcion para la carga masiva de los produtos

```ts
@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
  ){}

  async runSeed(){

    await this.insertNewProducts();
    return 'excuted seed'
  }

  private async insertNewProducts(){
    await this.productService.deleteAllProducts()

    const products = initialData.products;

    const insertPromises: Promise<any>[] = [];

    products.forEach(product =>
      insertPromises.push(this.productService.create(product))
    )

    await Promise.all(insertPromises);

    return
  }

}
```

## Asignar nombre personalizado a las tablas

Por defecto typeORM le asigna a las tablas el nombre de las entidades que estan definiendo la base de datos, pero si queremos usar un nombre diferentes por alguna razon, podemos hacerlo de la siguiente forma

```ts
...
@Entity({
    name: 'products'
})
export class Product {
    ...
}
```

```ts
...
@Entity({name: 'product_images'})
export class ProductImage{
    ...
}
```