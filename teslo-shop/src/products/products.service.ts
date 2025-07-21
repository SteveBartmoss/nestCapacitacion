import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto) {

    try{

      const product = this.productRespository.create(createProductDto);
      await this.productRespository.save(product);
      return product;

    }catch(error){
      this.handleExceptios(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const {limit = 10, offset = 0 } = paginationDto
      const productsList = await this.productRespository.find({
        take: limit,
        skip: offset
      });
      return productsList
    }catch(error){
      this.handleExceptios(error)
    }

  }

  async findOne(term: string) {

    try{

      let product: Product|null;

      if(isUUID(term)){
        product = await this.productRespository.findOneBy({id: term})
      }
      else{
        const queryBuilder = this.productRespository.createQueryBuilder();
        product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`,{
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        }).getOne();
      }

      if(!product){
        throw new NotFoundException(`Product whit id: ${term} not found`)
      }
      return product
    }catch(error){
      this.handleExceptios(error)
    }

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRespository.preload({
      id: id,
      ...updateProductDto
    });

    if(!product){
      throw new NotFoundException(`Product with id: ${id} not found`)
    } 
    
    try{
      return await this.productRespository.save(product);
    }catch(error){
      this.handleExceptios(error)
    }
    
  }

  async remove(id: string) {
    
    const product = await this.findOne(id) 
    await this.productRespository.remove(product!)
    return `This action removes a #${id} product`;
  }

  private handleExceptios(error: any){
    if(error.code === '23505'){
        throw new BadRequestException(error.detail);
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
