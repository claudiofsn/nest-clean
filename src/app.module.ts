import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { CustomerController } from './controllers/customer.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from 'env'
import { AuthModule } from './auth/auth.module'
import { JwtService } from '@nestjs/jwt'
import { QuestionsController } from './controllers/questions.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true
    }),
    AuthModule
  ],
  controllers: [CustomerController, QuestionsController],
  providers: [PrismaService],
})
export class AppModule { }
