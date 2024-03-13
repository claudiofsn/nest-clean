import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { QuestionsController } from "./controllers/questions.controller";
import { DatabaseModule } from "../database/database.module";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";
import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";
import { RegisterStundentUseCase } from "@/domain/forum/application/use-cases/register-student";
import { AuthenticateStundentUseCase } from "@/domain/forum/application/use-cases/authenticate-student";
import { CryptographyModule } from "../cryptography/cryptography.module";

@Module({
    imports: [DatabaseModule, CryptographyModule],
    controllers: [
        UserController,
        QuestionsController
    ],
    providers: [
        CreateQuestionUseCase,
        FetchRecentQuestionsUseCase,
        RegisterStundentUseCase,
        AuthenticateStundentUseCase
    ]
})
export class HttpModule {

}