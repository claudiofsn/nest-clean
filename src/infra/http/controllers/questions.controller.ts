import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'
import { QuestionPresenter } from '@/infra/presenters/question-presenter'

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

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionsController {
  constructor(
    private createQuestion: CreateQuestionUseCase,
    private fetchRecentQuestionsUseCase: FetchRecentQuestionsUseCase
  ) { }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    { content, title }: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      const userId = user.sub

      const question = await this.createQuestion.execute({
        authorId: userId,
        title,
        content,
        attachmentsIds: []
      })

      return question;
    } catch (error) { }
  }

  @Get()
  async fetchRecentQuestions(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
  ) {

    const result = await this.fetchRecentQuestionsUseCase.execute({
      page
    })

    if (result.isLeft()) {
      throw new Error("No questions")
    }

    const questions = result.value.questions

    return { questions: questions.map(QuestionPresenter.toHTTP) }
  }
}
