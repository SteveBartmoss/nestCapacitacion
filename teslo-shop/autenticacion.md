
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

Para encriptar el password se puede usar el paquete bcrypt que se instala con el siguiente comando

```bash
yarn add bcrypt
yarn add @type/bcrypt
```

Con esto podemos usar el paquete de bcrypt para encriptar el password antes de que se guarde en la base de datos de la siguiente manera

```ts
@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {

    try{

      const {password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save(user)

      return userData;
    
    }catch(error){
      this.handleDBErrors(error)
    }

  }
  ...
}
```

La funcion hashSync() recibe como parametro el password a encriptar y el segundo parametro permite que no se pueda atacar el password por tablas arcoiris


## Login del usuario

Para poder buscar al usuario que se autenticara podemos usar la siguiente funcion para comparar de forma segura el password

```ts
@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async login(loginUserDto: LoginUserDto){
    const {password, email} = loginUserDto

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true}
    });

    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)')
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Credentials are not valid (password)')
    }
    ...
  }
  ...
}
```

## Autenticacion por passport

Para poder trabajar con esta libreria se requiren las siguientes instalaciones por comando

```bash
yarn add @nestjs/passport passport
yarn add @nestjs/jwt passport-jwt 
```

Despues de realizar la instalacion de las librerias podemos realizar la siguiente configuracion para que el modulo se carge de manera normal

```ts
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn:'2h'
      }
    })
  ],
  exports: [TypeOrmModule]
})
export class AuthModule {}
```

Se puede implementar la carga de manera asincrona para el modulo de la siguiente forma

```ts
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn:'2h'
          }
        }
      }
    })
  ],
  exports: [TypeOrmModule]
})
export class AuthModule {}
```

De esta forma estamos haciendo la inyeccion del config module y tambien estamos realizando la configuracion asyncrona del JwtModule

## JwtStrategy

Para implementar la estrategia de jwt se deben seguir varios pasos, ya que debemos configurar el payload que se almacena en el json web token, para esto primero debemos definir lo siguiente en el archivo de `jwt-strategy` 

```ts
import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt,Strategy} from 'passport-jwt'
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }
    async validate( payload: JwtPayload ): Promise<User> {
        
        const {email} = payload;

        const user = await this.userRepository.findOneBy({email});

        if(!user){
            throw new UnauthorizedException('Token not valid')
        }

        if(!user.isActive){
            throw new UnauthorizedException('User is inactive, talk with an admin');
        }

        return user;
    }
}
```

De manera similar a como trabaja un interceptor, el jwtstrategy parece interceptar una peticion y es donde podemos hacer alguna configuracion para validar al usuario que estamos buscando pudiendo incluso lanzar excepciones en caso de que no se esten cumpliendo las validaciones que queremos realizar

## Generar un token

Ya que tenemos configurada la estrategia para el jwt podemos implementar la generacion del jwt de la siguiente manera 

```ts
private getJwtToken(payload: JwtPayload) {
  const token = this.jwtService.sign(payload);
  return token;
}
```

De esta forma firmamos el token y lo devolvemos para el usuario llamando esa funcion al crear un nuevo usuario o al logear un usuario 

```ts
@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto) {

    try{

      const {password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save(user)

      return {
        ...user,
        token: this.getJwtToken({email: user.email})
      }
    
    }catch(error){
      this.handleDBErrors(error)
    }

  }

  async login(loginUserDto: LoginUserDto){
    const {password, email} = loginUserDto

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true}
    });

    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)')
    }

    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('Credentials are not valid (password)')
    }

    return {...user,
      token: this.getJwtToken({email: user.email})
    };
  }
  ...
}
```

## Proteger rutas con jwt

Para poder usar la proteccion de una ruta tenemos que usar el siguiente decorador que integra la estrategia para poder validar que el token que mandamos en la peticion sea valido

```ts
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard())
  @Get('private')
  testingPrivateRoute(){
    return {ok: true, message: 'Hi stalker'}
  }
  
}
```