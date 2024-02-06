import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { CustomerController } from './controllers/customer.controller'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from 'env'

@Module({
  imports: [ConfigModule.forRoot({
    validate: env => envSchema
  })],
  controllers: [
    CustomerController
  ],
  providers: [PrismaService],
})
export class AppModule { }
