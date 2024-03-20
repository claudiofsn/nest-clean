import {
  BadRequestException,
  Body, ConflictException, Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
  UsePipes
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { AuthenticateStundentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { RegisterStundentUseCase } from '@/domain/forum/application/use-cases/register-student'
import { InvalidCredentialsError } from '@/domain/forum/application/use-cases/errors/invalid-credentials-error'
import { StudentAlreadyExistsError } from '@/domain/forum/application/use-cases/errors/student-already-exists-error'
import { Public } from '@/infra/auth/public'

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
  @Public()
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async create(@Body() { email, name, password }: CreateAccountBodySchema) {
    const result = await this.registerStundentUseCase.execute({
      email, name, password
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case StudentAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message)
      }

    }


  }

  @Get('authenticate')
  @Public()
  @UsePipes(new ZodValidationPipe(authenticateQuerySchema))
  async autenthicate(@Query() { email, password }: AuthenticateQuerySchema) {
    const result = await this.authenticateStundentUseCase.execute({
      email,
      password
    })

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message);

        default:
          throw new BadRequestException(error.message);
      }
    }

    const { accessToken } = result.value

    return {
      accessToken,
    }
  }
}
