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

