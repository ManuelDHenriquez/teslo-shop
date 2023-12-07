import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, } from 'typeorm';

@Entity('users')
export class User {

  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'User email',
    uniqueItems: true
  })
  @Column('text', {
    unique: true,
  })
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'User password',
  })
  @Column('text', {
    select: false,
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @Column('text')
  fullName: string;

  @ApiProperty({
    example: true,
    description: 'User active status',
    default: true
  })
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: ['user'],
    description: 'User roles',
    default: ['user']
  })
  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(
    () => Product,
    ( product) => product.user,
  )
  product?: Product;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  emailToLowerCaseOnUpdate() {
    this.emailToLowerCase();
  }
}
