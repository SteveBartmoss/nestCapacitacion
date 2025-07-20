## Configurar el docker compose para la base de datos

Como ya se hizo en un curso anterior, podemos configurar un archivo de docker para levanta la base de datos de una forma simple, esto lo haremos con un archivo como el siguiente

```yaml
version: '3'

services:
  db:
    image: postgres:14.3
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    container_name: teslodb
    volumes:
      - ./postgres:/var/lib/postgresql/data
```

**Importante** Se debe tener un archivi __.env__ para que tome las variables del nombre y el pasword de la base de datos, o en su defecto dejarlas escritas en el yaml