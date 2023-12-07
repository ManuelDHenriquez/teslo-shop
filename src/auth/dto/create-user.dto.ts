import { Type } from '@angular/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {

  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'User email',
    uniqueItems: true
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Pa$$w0rd',
    description: 'User password, must have a Uppercase, lowercase letter and a number'
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name'
  })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({
    example: true,
    description: 'User active status',
    default: true
  })
  @IsOptional()
  @IsArray()
  roles: string[];
}
