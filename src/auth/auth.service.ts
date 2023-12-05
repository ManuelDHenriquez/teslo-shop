import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './strategies/interfaces/jwt-payload.interface';

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
        token: this.getJwtToken({ id: user.id  }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });    

    if (!user) {
      throw new UnauthorizedException(`Invalid credentials (email)`);
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Invalid credentials (password)`);
    }
    
    console.log(user);
    
    return {
      ...user,
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
