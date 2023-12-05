import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { GetUser, RawHeaders } from '../decorators';
import { CreateUserDto, LoginUserDto } from './dto';

import { IncomingHttpHeaders } from 'http';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard()) // <== This is the important part
  testingPrivateModule(
    @Req() request: Express.Request, // <== This is the important part
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  @Get('private2')
  @UseGuards(AuthGuard()) // <== This is the important part
  @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard ) // <== This is the important part
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user,
    };
  }
}
