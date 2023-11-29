import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, handleRetry } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createProductDto: CreateProductDto) {

    try {
      

      const newProduct = this.productRepository.create(createProductDto);
      await this.productRepository.save(newProduct);
      
      return newProduct;

    } catch (error) {

      this.handleDBExceptions(error);

    }
  }

  async findAll( paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find(
      {
        take: limit,
        skip: offset,
        // TODO: relaciones
      }
    );
  }

  async findOne(term: string) {

    let product: Product;

    if( isUUID(term) ) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      console.log("Hasta aqui llega");
      
      product = await queryBuilder 
        .where('UPPER(title) =:title or slug =:slug', {   
          title: term.toLocaleUpperCase(),
          slug: term.toLocaleLowerCase()
        }).getOne();
    }
    if (!product) 
      throw new InternalServerErrorException(`Product with ${term} not found`);
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if (!product) 
      throw new NotFoundException(`Product with ${id} not found`);

    try {
      await this.productRepository.save(product);
    }catch (error) {
      this.handleDBExceptions(error);
    }

    return product;
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove( product );
  }

  private handleDBExceptions (error: any) {
    if (error && error.code === '23505') {
      throw new InternalServerErrorException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}


