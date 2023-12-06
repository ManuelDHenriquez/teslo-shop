import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 3
    })
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({
        description: 'Product price',
        nullable: false,
        minimum: 0
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];

}
