import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ){}

  async create(createProductDto: CreateProductDto) {

    try{

      const {images = [], ...productDetails} = createProductDto;
      const product = this.productRespository.create({
        ...productDetails, 
        images: images.map(image => this.productImageRepository.create({url: image}))
      });

      await this.productRespository.save(product);
      return {...product,images: images};

    }catch(error){
      this.handleExceptios(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const {limit = 10, offset = 0 } = paginationDto
      const productsList = await this.productRespository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      });
      return productsList.map(({images, ...rest}) => ({
        ...rest,
        images: images?.map( img => img.url)
      }))
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
        const queryBuilder = this.productRespository.createQueryBuilder('prod');
        product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`,{
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        }).leftJoinAndSelect('prod.images','prodImages').getOne();
      }

      if(!product){
        throw new NotFoundException(`Product whit id: ${term} not found`)
      }

      return product
    }catch(error){
      this.handleExceptios(error)
    }

  }

  async finOnePlain(term: string){
    const {images = [], ...rest } = (await this.findOne(term))!;
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRespository.preload({
      id: id,
      ...toUpdate,
    });

    if(!product){
      throw new NotFoundException(`Product with id: ${id} not found`)
    } 

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction()
    
    try{

      if(images){
        await queryRunner.manager.delete( ProductImage,{product: {id}})

        product.images = images.map(image => this.productImageRepository.create({url: image}))
      } 

      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()

      //return await this.productRespository.save(product);

      return this.finOnePlain(id);
      
    }catch(error){
      await queryRunner.rollbackTransaction();
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

  async deleteAllProducts(){
    const query = this.productRespository.createQueryBuilder('product')

    try{
      return  await query.delete().where({}).execute();
    }catch(error){
      this.handleExceptios(error)
    }
  }
}
