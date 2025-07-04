export const pokemonIds = [1,20,30,34,66];


pokemonIds.push('papa') //esto es erroneo ya que no podemos agregar un string a un entero

pokemonIds.push(+'1') // Esto es comun verlo y es la forma en que se convierte el string a entero


// con esto utilizamos un objeto comun en js
export const pokemon = {
    id: 1,
    name: 'Bulbasaur',
}

export interface Pokemon {
    id: number;
    name: string;
    age?: number;
} 

export const bulbasaur: Pokemon = {

    id: 1,
    name: 'Bulbasaur',

}

export const charmander: Pokemon = {
    id: 4,
    name: 'Charmander',
    age: 4
}

export const pokemons: Pokemon[] = [];

pokemons.push(bulbasaur,charmander)