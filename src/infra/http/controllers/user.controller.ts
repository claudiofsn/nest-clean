import {
  Body, Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UsePipes
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { AuthenticateStundentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { RegisterStundentUseCase } from '@/domain/forum/application/use-cases/register-student'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

const authenticateQuerySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateQuerySchema = z.infer<typeof authenticateQuerySchema>

@Controller('user')
export class UserController {
  constructor(
    private registerStundentUseCase: RegisterStundentUseCase,
    private authenticateStundentUseCase: AuthenticateStundentUseCase
  ) { }

  @Post('register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async create(@Body() { email, name, password }: CreateAccountBodySchema) {
    const result = await this.registerStundentUseCase.execute({
      email, name, password
    });

    if (result.isLeft()) {
      throw new Error()
    }


  }

  @Get('authenticate')
  @UsePipes(new ZodValidationPipe(authenticateQuerySchema))
  async autenthicate(@Query() { email, password }: AuthenticateQuerySchema) {
    const result = await this.authenticateStundentUseCase.execute({
      email,
      password
    })

    if (result.isLeft()) {
      throw new Error
    }

    const { accessToken } = result.value

    return {
      accessToken,
    }
  }
}
