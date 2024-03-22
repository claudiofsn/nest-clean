import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe';
import { z } from 'zod';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';
import { QuestionPresenter } from '@/infra/presenters/question-presenter';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

const editQuestionBodyValidationPipe = new ZodValidationPipe(
  editQuestionBodySchema,
);

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>;

@Controller('/questions')
export class QuestionsController {
  constructor(
    private createQuestion: CreateQuestionUseCase,
    private fetchRecentQuestionsUseCase: FetchRecentQuestionsUseCase,
    private getQuestionBySlugUseCase: GetQuestionBySlugUseCase,
    private editQuestionUseCase: EditQuestionUseCase,
  ) {}

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
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return result;
  }

  @Get()
  async fetchRecentQuestions(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
  ) {
    const result = await this.fetchRecentQuestionsUseCase.execute({
      page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const questions = result.value.questions;

    return { questions: questions.map(QuestionPresenter.toHTTP) };
  }

  @Get(':slug')
  async questionBySlug(@Param('slug') slug: string) {
    const result = await this.getQuestionBySlugUseCase.execute({
      slug,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { question: QuestionPresenter.toHTTP(result.value.question) };
  }

  @Put(':id')
  @HttpCode(204)
  async editQuestion(
    @Body(editQuestionBodyValidationPipe) body: EditQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const { title, content } = body;
    const userId = user.sub;

    const result = await this.editQuestionUseCase.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
