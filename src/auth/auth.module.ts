import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([ User ]),

    PassportModule.register( {defaultStrategy: 'jwt'} ),

    JwtModule.registerAsync({
     imports: [ ConfigModule],
     inject: [ ConfigService ],
     useFactory: async ( configService: ConfigService ) => {
      console.log('JWT Secret', configService.get('JWT_SECRET'));
      
      console.log('JWT_SECRET', process.env.JWT_SECRET);
      return {
        secret: process.env.JWT_SECRET,
        signOptions: {
        expiresIn: '2d'
      }}
      }
    }),

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2d'
    //   }
    // }),
  ],
  exports: [
    TypeOrmModule
  ],
})
export class AuthModule {}
