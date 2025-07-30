import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

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

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(loginUserDto: LoginUserDto){
    try{
      const {password, email} = loginUserDto

      const user = await this.userRepository.findOneBy({email})

      return user

    }catch(error){
      this.handleDBErrors(error)
    }
  }

  private handleDBErrors(error: any){

    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }
}
