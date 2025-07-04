import axios from 'axios';

//forma tradicional
export class Pokemon {

    public readonly id: number;
    public name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
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

    async getMoves(){
        
        const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon/4');

        return data.moves;
    }
    
}

//forma abrevida se debe tener inactiva la configuracion de erasableSyntaxOnly en config.ts
export class Pokebola {
    constructor(
        public level: string,
        public name: string,
    ){}
}

export const picachu = new Pokemon(6, 'Picachu')

