export class NewPokemon {

    public readonly id: number;
    public name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }

    scream(){
        console.log(`Hi Stalker!!`)
    }

    speak(){
        console.log(`Viejon!`)
    }
}

const MyDecorator = () => {
    return (target: Function) => {
        return NewPokemon
    }
}

@MyDecorator()
export class Pokemon {

    public readonly id: number;
    public name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }

    scream(){
        console.log(`${this.name.toUpperCase()}!!`)
    }

    speak(){
        console.log(`${this.name}, ${this.name}!`)
    }
}