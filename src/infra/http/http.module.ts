import { Module } from '@nestjs/common';
import { UserController } from './controllers/users.controller';
import { QuestionsController } from './controllers/questions.controller';
import { DatabaseModule } from '../database/database.module';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';
import { RegisterStundentUseCase } from '@/domain/forum/application/use-cases/register-student';
import { AuthenticateStundentUseCase } from '@/domain/forum/application/use-cases/authenticate-student';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question';
import { AnswerQuestionController } from './controllers/answers-question.controller';
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question';
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer';
import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers';
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer';
import { CommentsController } from './controllers/comments.controller';
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [UserController, QuestionsController, AnswerQuestionController, CommentsController],
  providers: [
    CreateQuestionUseCase,
    FetchRecentQuestionsUseCase,
    RegisterStundentUseCase,
    AuthenticateStundentUseCase,
    GetQuestionBySlugUseCase,
    EditQuestionUseCase,
    DeleteQuestionUseCase,
    AnswerQuestionUseCase,
    EditAnswerUseCase,
    DeleteAnswerUseCase,
    FetchQuestionAnswersUseCase,
    ChooseQuestionBestAnswerUseCase,
    CommentOnAnswerUseCase
  ],
})
export class HttpModule { }
