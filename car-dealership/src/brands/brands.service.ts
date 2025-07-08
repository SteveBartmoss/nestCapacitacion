import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';
import { v4 as uuid } from 'uuid'; 

@Injectable()
export class BrandsService {

  private brands: Brand[] = [
    {
      id: uuid(),
      name: 'Toyota',
      createdAt: new Date().getTime()
    }
  ]
  create(createBrandDto: CreateBrandDto) {

    this.brands.push({id: uuid(), name: createBrandDto.name.toLowerCase(), createdAt: new Date().getTime()})

    return 'Brand created :)';
  }

  findAll() {
    return this.brands;
  }

  findOne(id: string) {
    const brand = this.brands.find(element => element.id === id);

    if(!brand){
      throw new NotFoundException(`Brand with id '${id}' not found`);
    }

    return brand;

  }

  update(id: string, updateBrandDto: UpdateBrandDto) {

    let brandDB = this.findOne(id);

    this.brands = this.brands.map( element => {
      if(element.id === id){
        brandDB.updatedAt = new Date().getTime();
        brandDB = {
          ...brandDB,
          ...updateBrandDto,
          id,
        }

        return brandDB;
      }

      return element;

    })

    return `This action updates a #${id} brand`;

  }

  remove(id: string) {

    this.brands = this.brands.filter(element => element.id !== id);

    return `This action removes a #${id} brand`;
    
  }
}
