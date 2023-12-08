import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Logger } from '@nestjs/common'; 

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtServce: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      //ToDo: Retornar el token de autenticación

      return {
        ...user,
        // token: this.getJwtToken({ id: user.id, fullName: user.fullName, email: user.email, roles: user.roles }),
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async checkAuthStatus( user: User ) {

    return {
      ...user,
      // token: this.getJwtToken({ id: user.id, fullName: user.fullName, email: user.email, roles: user.roles }),
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, fullName: true, roles: true },
    });    

    if (!user) {
      throw new UnauthorizedException(`Invalid credentials (email)`);
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Invalid credentials (password)`);
    }
    
    // console.log(user);
    
    return {
      //...user,
      // token: this.getJwtToken({ id: user.id, fullName: user.fullName, email: user.email, roles: user.roles }),
      token: this.getJwtToken({ id: user.id }),
    }
    
  }

  private handleDBExceptions(error: any): never {
    if (error && error.code === '23505') {
      throw new InternalServerErrorException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private getJwtToken(paylodad: JwtPayload) {
    const token = this.jwtServce.sign(paylodad);
    return token;
  }
}
