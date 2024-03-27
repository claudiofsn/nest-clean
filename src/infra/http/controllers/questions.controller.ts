import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'
import { QuestionPresenter } from '@/infra/presenters/question-presenter'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question'
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question'
import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers'
import { AnswerPresenter } from '@/infra/presenters/answer.presenter'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const editQuestionBodyValidationPipe = new ZodValidationPipe(
  editQuestionBodySchema,
)

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>

@Controller('/questions')
export class QuestionsController {
  constructor(
    private createQuestion: CreateQuestionUseCase,
    private fetchRecentQuestionsUseCase: FetchRecentQuestionsUseCase,
    private getQuestionBySlugUseCase: GetQuestionBySlugUseCase,
    private editQuestionUseCase: EditQuestionUseCase,
    private deleteQuestionUseCase: DeleteQuestionUseCase,
    private fetchQuestionAnswersUseCase: FetchQuestionAnswersUseCase,
    private chooseQuestionBestAnswerUseCase: ChooseQuestionBestAnswerUseCase
  ) { }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    { content, title }: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.createQuestion.execute({
      authorId: user.sub,
      title,
      content,
      attachmentsIds: [],
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return result
  }

  @Get()
  async fetchRecentQuestions(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
  ) {
    const result = await this.fetchRecentQuestionsUseCase.execute({
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const questions = result.value.questions

    return { questions: questions.map(QuestionPresenter.toHTTP) }
  }

  @Get(':slug')
  async questionBySlug(@Param('slug') slug: string) {
    const result = await this.getQuestionBySlugUseCase.execute({
      slug,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return { question: QuestionPresenter.toHTTP(result.value.question) }
  }

  @Put(':id')
  @HttpCode(204)
  async editQuestion(
    @Body(editQuestionBodyValidationPipe) body: EditQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const { title, content } = body
    const userId = user.sub

    const result = await this.editQuestionUseCase.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteQuestion(
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const userId = user.sub

    const result = await this.deleteQuestionUseCase.execute({
      questionId,
      authorId: userId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }

  @Get(':questionId/answers')
  async fetchRecentQuestionAnswers(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Param('questionId') questionId: string,
  ) {
    const result = await this.fetchQuestionAnswersUseCase.execute({
      page,
      questionId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const answers = result.value.answers

    return { answers: answers.map(AnswerPresenter.toHTTP) }
  }

  @Patch(':answerId/choose-as-best')
  @HttpCode(204)
  async chooseQuestionBestAnswer(
    @CurrentUser() user: UserPayload,
    @Param('answerId') answerId: string,
  ) {
    const userId = user.sub

    const result = await this.chooseQuestionBestAnswerUseCase.execute({
      authorId: userId,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
