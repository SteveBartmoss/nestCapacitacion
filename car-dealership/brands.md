# Generar resources

En las secciones anteriores se vieron comandos para la creacion de los servicios, controladores y modulo de manera independiente, pero ahora usare un comando mas efectivo ya que crea todos los elementos necesarios de una sola vez con el siguiente comando

```bash
nest g res brands --no-spec
```

Despues de esto nos aparecen las opciones para definir el tipo de resource que queremos crear

```bash
? What transport layer do you use? (Use arrow keys) 
❯ REST API
    GraphQL (code first)
    GraphQL (schema first)
    Microservice (non-HTTP)
    WebSockets
```

Tambien nos pregunta si queremos generar los entry points

```bash
Would you like to generate CRUD entry points? Yes
```


## Entities

El comando para crear el resource genera por defecto la entities que es una representacion de como se tiene en base de datos la informacion de brands, es similiar a las interfaces pero se trata de una clase como tal y ademas representa una entidad de la base de datos

## Inyeccion de servicios en otros servicios

Una de las cualidades de la abstraccion de nest es el poder reutilizar logica de los modulos para poder implementarla en otros modulos, en este caso no se reutilizara informacion pero si se acceder a funciones de otros servicios en el servicio de seeds.

Para esto debemos exportar los servicios que queremos usar fuera de un modulo en concreto, (no estoy seguro pero no se deberian exportar modulo ni controladores, pues de entrada no son inyectables)

```ts
@Module({
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
```

De esta forma en el archivo .module se exporta el servicio que vamos a utilizar fuera del modulo de Cars, como tambien usaremos el serivicio de brands, debemos exportarlo en .modulo de brands.

```ts
@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
```

Con esto tenemos expuestos los servicios hacia cualquiero de los otros modulos de la aplicacion. 

Como los serivicios los usaremos en el modulo de seed, debemos importalos en el mismo archivo .module para poder resolver las importaciones en donde usemos los servicios.

```ts
@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [CarsModule,BrandsModule],
})
export class SeedModule {}
```

**Importante** Si bien los que se exporta el servicio se tiene que importar el modulo para usar un serivicio expuesto, algo raro pues no se esta exportando el modulo pero posiblemente sea porque busca el modulo y despues resuleve los exports de ese mismo modulo y por eso se importa el mismo. 

Ya que tenemos las importaciones podemos inyectar las dependencias en el constructor y usar las funciones de servicios externos al modulo

```ts
@Injectable()
export class SeedService {

  constructor(
    private readonly carsService: CarsService,
    private readonly brandsService: BrandsService,
  ){}

  populateDB(){
    this.carsService.fillCarsWithSeedData(CARS_SEED)
    this.brandsService.fillBrandsWithSeedData(BRANDS_SEED)

    return 'Seeders executed'

  }

}
```

## Generar build de produccion basico

para generar un build de produccion basico se puede utilizar el siguiente comando

```bash
yarn build
```

Cuando tenemo el build generado simplemente usamos el siguiente comando para correr el buil de produccion

```bash
yarn start:prod
```
