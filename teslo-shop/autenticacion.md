
## Entidad usuarios

Para implementar la nueva funcion de autenticacion en el proyecto podemos generar un nuevo resource 

```bash
nest g res auth --no-spec 
```

### Declarar la entidad

```ts
@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true,
    })
    email: string

    @Column('text')
    password: string

    @Column('text')
    fullName: string

    @Column('bool')
    isActive: boolean

    @Column('text',{
        array: true,
        default: []
    })
    roles: string[];
}
```

**Importante** Para que la entidad se sincronice debemos agregar la importacion de TypeOrmModule como forFeature, de esta forma se sincroniza la entidad en la base de datos


### Implementar patron repository

Para poder usar el patron repository tenemos que realizar una inyeccion del mismo en el servicio de usuarios

```ts
@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  
}
```

Con esto ya podemos utilizar el patron repository para nuestro endpoint

## Encriptar password

Para encriptar la password se pueda usar el paquete bcrypt que se instala con el siguiente comando

```bash
yarn add bcrypt
yarn add @type/bcrypt
```