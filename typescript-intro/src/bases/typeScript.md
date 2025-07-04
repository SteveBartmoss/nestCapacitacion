# Tipos de datos

En typescript la forma de asignar un valor de la siguiente manera

```ts
let name: string = 'Steve'
```

De esta forna agregamos la regla de traspilacion que le asigna un tipo de dato a la variable que declaramos, esto es asi porque ts trabaja sobre js y al momento de ser 'compilado' se manejan los tipos de datos que se determinan para una variable

**Ventajas**

- Deteccion de errores: Como se esta agregando la bandera del tipo de dato, podemos evitar un 'casteo' involuntario de tipo de dato en javascript, como se puede ver en 
el siguiente ejemplo

```js
let name = 'Steve'

name = {
    age: 10,
    name: 'Steve'
}
```

Esto en js es valido, ya que el tipo de dato no esta defino y simplenente se asigna la memoria necesaria para el nuevo tipo de dato, esto no es necesariamente un problema pero algunas personas no pueden manejar esos caso y decidieron crear una solucion.

```ts
let name: string = 'Steve'

name = {
    age: 10,
    name: 'Steve'
}
```

Esto en ts no es valido, ya que al inicio definimos name como un string y por eso nos permite detectar un 'error' en el momento de asignar un tipo de dato diferente.

- Mejor uso del ide: Como typescript hace la asignacion 


# Interfaces

Una interface es una manera de declarar la estructura de un objeto y que sus campos sean consistentes.

```ts
export interface Pokemon {
    id: number;
    name: string;
    age?: number;
}
```

Con lo anterior nos aseguramos que los campos sean respetados con su tipo y ademas que no falten, pues la unica forma de que el campo pueda ser opcional es agregando el ? despues del nombre del campo ya que de esta manera el campo puede o no estar definido en una instancia de la interfaz. 

Las interfaces son muy parecidas a los objetos de la toda la vida, pero estan definidos de una forma mas simple y ademas no son por definición un objeto

Para definir un arreglo del tipo de interface que definimos o algun otro tipo de dato, podemos usar la siguiente notacion. 

```ts
export const pokemons: Pokemon[] = [];
```

# Classes

En typescript podemos definir las clases de una manera similar a como se hace en js solamente que debemos definir el acceso y el tipo de datos de las propiedades

```ts
export class Pokemon {

    public id: number;
    public name: string;


    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }
}
```

## Getters y metodos

Una clase tanto en js como en ts puede tener getters y meotodos, que son funciones que en el caso de un get accede a propiedades de la case y las devuelve procesadas o con el mismo valor, un metodo es una funcion que se puede llamar desde una instancia de la clase.

**ejemplo get**

```ts
get imageUrl(): string{
    return `https://pokemon.com/${this.id}.jpg`;
}
```

**ejemplo metodo**

```ts
get imageUrl(): string{
    return `https://pokemon.com/${this.id}.jpg`;
}
```

### Uso de this

Es importante notar que en los metodos se esta usando el this, esto es porque en los metodos queremos referenciar los valores que tienen las instancias de la clase y no un valor estatico de clase, cuando se trabaja con clases y se crea una instancia, se puede ver como un contenedor, para acceder al contenido de un determinado contenedor se usa this.

## Metodos asyncronos

Un metodo asyncrono es como cualquier otro metodo pero con la diferencia de que tendra un proceso asyncrono dentro de el, en este caso se esta llamando una api para obtener informacion y esto es lo que hace referencia a un metodo asyncrono

```ts
async getMoves(){
        
    const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon/4');

    return data.moves;
}
```

## Tipo de dato para respuestas genericas

Cuando llamamos a una api desde el codigo, podemos obtener una respuesta generica ya que las apis componen una respuesta externa a nuestro codigo. Pero como en ts tenemos tantas ventajas al saber que tipo de dato nos regresa una funcion si usamos una api externa estariamos rompiendo esta convencion de esto pues la api solo nos da la respuesta y listo, para estos casos podemos definir una interface que nos permite visualizar que tipo de dato nos regresa la a api.

```ts
import type { Move, PokeAPIResponse } from '../interfaces/pokeapi-response.interface';

export class Pokemon {

    async getMoves(): Promise<Move[]> {
        
        const {data} = await axios.get<PokeAPIResponse>('https://pokeapi.co/api/v2/pokemon/4');

        return data.moves;
    }
    
}
```

La interface que creamos tendria el siguiente aspecto 

```ts
export interface PokeAPIResponse {
    abilities:                Ability[];
    base_experience:          number;
    cries:                    Cries;
    forms:                    Species[];
    game_indices:             GameIndex[];
    height:                   number;
    held_items:               any[];
    id:                       number;
    is_default:               boolean;
    location_area_encounters: string;
    moves:                    Move[];
    name:                     string;
    order:                    number;
    past_abilities:           PastAbility[];
    past_types:               any[];
    species:                  Species;
    sprites:                  Sprites;
    stats:                    Stat[];
    types:                    Type[];
    weight:                   number;
}

export interface Ability {
    ability:   Species | null;
    is_hidden: boolean;
    slot:      number;
}

export interface Species {
    name: string;
    url:  string;
}

export interface Cries {
    latest: string;
    legacy: string;
}

export interface GameIndex {
    game_index: number;
    version:    Species;
}

export interface Move {
    move:                  Species;
    version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
    level_learned_at:  number;
    move_learn_method: Species;
    order:             number | null;
    version_group:     Species;
}

export interface PastAbility {
    abilities:  Ability[];
    generation: Species;
}

export interface GenerationV {
    "black-white": Sprites;
}

export interface GenerationIv {
    "diamond-pearl":        Sprites;
    "heartgold-soulsilver": Sprites;
    platinum:               Sprites;
}

export interface Versions {
    "generation-i":    GenerationI;
    "generation-ii":   GenerationIi;
    "generation-iii":  GenerationIii;
    "generation-iv":   GenerationIv;
    "generation-v":    GenerationV;
    "generation-vi":   { [key: string]: Home };
    "generation-vii":  GenerationVii;
    "generation-viii": GenerationViii;
}

export interface Other {
    dream_world:        DreamWorld;
    home:               Home;
    "official-artwork": OfficialArtwork;
    showdown:           Sprites;
}

export interface Sprites {
    back_default:       string;
    back_female:        null;
    back_shiny:         string;
    back_shiny_female:  null;
    front_default:      string;
    front_female:       null;
    front_shiny:        string;
    front_shiny_female: null;
    other?:             Other;
    versions?:          Versions;
    animated?:          Sprites;
}

export interface GenerationI {
    "red-blue": RedBlue;
    yellow:     RedBlue;
}

export interface RedBlue {
    back_default:      string;
    back_gray:         string;
    back_transparent:  string;
    front_default:     string;
    front_gray:        string;
    front_transparent: string;
}

export interface GenerationIi {
    crystal: Crystal;
    gold:    Gold;
    silver:  Gold;
}

export interface Crystal {
    back_default:            string;
    back_shiny:              string;
    back_shiny_transparent:  string;
    back_transparent:        string;
    front_default:           string;
    front_shiny:             string;
    front_shiny_transparent: string;
    front_transparent:       string;
}

export interface Gold {
    back_default:       string;
    back_shiny:         string;
    front_default:      string;
    front_shiny:        string;
    front_transparent?: string;
}

export interface GenerationIii {
    emerald:             OfficialArtwork;
    "firered-leafgreen": Gold;
    "ruby-sapphire":     Gold;
}

export interface OfficialArtwork {
    front_default: string;
    front_shiny:   string;
}

export interface Home {
    front_default:      string;
    front_female:       null;
    front_shiny:        string;
    front_shiny_female: null;
}

export interface GenerationVii {
    icons:                  DreamWorld;
    "ultra-sun-ultra-moon": Home;
}

export interface DreamWorld {
    front_default: string;
    front_female:  null;
}

export interface GenerationViii {
    icons: DreamWorld;
}

export interface Stat {
    base_stat: number;
    effort:    number;
    stat:      Species;
}

export interface Type {
    slot: number;
    type: Species;
}
```

Aunque la interface resulta bastante extenda podemos crearla de manera simple con la extension Paste JSON as Code, de esta forma simplemente copiamos la respuesta generica y se creara la interface de forma automatica.

## Inyeccion de dependencias

Cuando trabajamos con codigo de terceros no debemos dejar el codigo implementando en cada clase, ya que esto creamos un error en caso de que llegue a cambiar el uso de codigo de terceros, por ejemplo si axios deja de usar simplemente .get por esto es mejor utilizar un adaptador que se inyecte como dependencia. 

El adaptador tiene la siguiente forma 

```ts
import axios from 'axios';

export class PokeApiAdapter{

    private readonly axios = axios;

    async getRequest(url: string){
        const {data} = await this.axios.get(url);

        return data
    }

    async postRequest(url: string, data: any){
        return
    }

    async patchRequest(url: string, data: any){
        return
    }

    async deleteRequest(url: string){
        return
    }

}
```

Con esto ya tenemos la implementacion del codigo de terceros en una sola parte y en caso de tener que modificar algo solo se haria en esta parte del codigo, la forma de inyectar la dependencia seria la siguiente

```ts
import type { Move, PokeAPIResponse } from '../interfaces/pokeapi-response.interface';
import { PokeApiAdapter } from '../api/pokeApi.adapter';

export class Pokemon {

    public readonly id: number;
    public name: string;
    private readonly http: PokeApiAdapter; 
    

    constructor(id: number, name: string, http: PokeApiAdapter){
        this.id = id;
        this.name = name;
        //inyection de dependencia
        this.http = http;
    }

    get imageUrl(): string{
        return `https://pokemon.com/${this.id}.jpg`;
    }

    scream(){
        console.log(`${this.name.toUpperCase()} !!!`);
    }

    speack(){
        console.log(`${this.name}, ${this.name}`);
    }

    async getMoves(): Promise<Move[]> {
        
        const {data} = await this.http.getRequest('https://pokeapi.co/api/v2/pokemon/4');

        return data.moves;
    }
    
}
```

De esta forma tenemos la inyeccion de la dependencia de terceros y tambien evitamos que se pueda romper el codigo a futuro