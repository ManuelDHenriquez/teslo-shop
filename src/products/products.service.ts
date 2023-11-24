import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
      product = await this.productRepository.findOneBy({slug: term});
    }
    if (!product) 
      throw new InternalServerErrorException(`Product with ${term} not found`);
    
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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


