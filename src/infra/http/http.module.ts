import { Module } from "@nestjs/common";
import { CustomerController } from "./controllers/customer.controller";
import { QuestionsController } from "./controllers/questions.controller";
import { DatabaseModule } from "../database/database.module";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";
import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";

@Module({
    imports: [DatabaseModule],
    controllers: [
        CustomerController,
        QuestionsController
    ],
    providers: [
        CreateQuestionUseCase,
        FetchRecentQuestionsUseCase
    ]
})
export class HttpModule {

}