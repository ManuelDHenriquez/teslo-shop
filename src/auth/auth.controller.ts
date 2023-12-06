import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { GetUser, RawHeaders, Auth } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus( 
    @GetUser() user: User) {
    return this.authService.checkAuthStatus( user );
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
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
  @UseGuards(AuthGuard(), UserRoleGuard ) // <== This is the important part
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth( ValidRoles.admin, ValidRoles.superUser, )
  privateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user,
    };
  }
}
