import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { Product, ProductImage } from './entities';
import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const newProduct = this.productRepository.create({
        ...productDetails,
        images: images.map((url) =>
          this.productImageRepository.create({ url }),
        ),
        user
      });
      await this.productRepository.save(newProduct);

      return { ...newProduct, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return products.map(({ images, ...res }) => ({
      ...res,
      images: images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');

      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toLocaleUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }
    if (!product)
      throw new InternalServerErrorException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) throw new NotFoundException(`Product with ${id} not found`);

    // create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images && images.length) {
        // delete all images
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      } else {
        // update product
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }

      product.user = user;

      await queryRunner.manager.save(product); // save product

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

      // await this.productRepository.save(product);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }

    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return {
      statusCode: HttpStatus.OK,
      message: 'All products deleted',
    };
  }

  private handleDBExceptions(error: any) {
    if (error && error.code === '23505') {
      throw new InternalServerErrorException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where( {} )
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
