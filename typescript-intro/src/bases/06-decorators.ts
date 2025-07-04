const Deprecated = (deprecationReason: string) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Guardamos una referencia al método original
        const originalMethod = descriptor.value;

        // Modificamos el descriptor para cambiar el comportamiento del método
        descriptor.value = function (...args: any[]) {
            console.warn(`Method ${propertyKey} is deprecated with reason: ${deprecationReason}`);
            // Llamamos al método original con el contexto correcto (this) y los argumentos
            return originalMethod.apply(this, args);
        };

        return descriptor; // Retornamos el descriptor modificado
    };
};

export class Pokemon {
    public readonly id: number;
    public name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    scream() {
        console.log(`${this.name.toUpperCase()}!!`);
    }

    @Deprecated('Most use speak2 method instead')
    speak() {
        console.log(`${this.name}, ${this.name}!`);
    }

    speak2() {
        console.log(`${this.name}, ${this.name}!`);
    }
}