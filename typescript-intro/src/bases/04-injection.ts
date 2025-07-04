import type { Move, PokeAPIResponse } from '../interfaces/pokeapi-response.interface';
import { PokeApiAdapter, PokeApiFetchAdapter, type HttpAdapter } from '../api/pokeApi.adapter';

//forma tradicional
export class Pokemon {

    public readonly id: number;
    public name: string;
    private readonly http: HttpAdapter; 
    

    constructor(id: number, name: string, http: HttpAdapter){
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
        
        const data = await this.http.getRequest<PokeAPIResponse>('https://pokeapi.co/api/v2/pokemon/4');

        return data.moves;
    }
    
}

const pokeApi = new PokeApiAdapter();
const pokeApiFetch = new PokeApiFetchAdapter();

export const picachu = new Pokemon(6, 'Picachu',pokeApi)
export const raichu = new Pokemon(8, 'Raichu', pokeApiFetch)
