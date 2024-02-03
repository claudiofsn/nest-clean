import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { CustomerController } from './controllers/customer.controller'

@Module({
  imports: [],
  controllers: [
    CustomerController
  ],
  providers: [PrismaService],
})
export class AppModule { }
