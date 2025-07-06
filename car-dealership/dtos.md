# Interfaces en endpoints

Una forma de mantener la consistencia de la informacion que espera obtener al momento de recibir informacion en el backend de nest, es mediante el uso de una interface.


```ts
export interface Car{

    id: string; 
    brand: string;
    model: string;
    
}
```

De esta forma tenemos la definicion de lo que esperamos recibir en el endpoint