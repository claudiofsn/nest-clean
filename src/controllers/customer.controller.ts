import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

const authenticateQuerySchema = z.object({
  email: z.string().email(),
  password: z.string()
})

type AuthenticateQuerySchema = z.infer<typeof authenticateQuerySchema>

@Controller('customer')
export class CustomerController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) { }

  @Post('register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async create(@Body() { email, name, password }: CreateAccountBodySchema) {
    const emailInUse = await this.prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (emailInUse) {
      throw new ConflictException('User with same email address already exist')
    }

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
  }

  @Get("/authenticate")
  @UsePipes(new ZodValidationPipe(authenticateQuerySchema))
  async autenthicate(@Query() { email, password }: AuthenticateQuerySchema) {
    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new UnauthorizedException("User credentials doenst match")
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("User credentials doenst match")
    }

    const accessToken = this.jwt.sign({ sub: user.id })

    return {
      accessToken
    }
  }
}
