import { Module } from "@nestjs/common";
import { CustomerController } from "./controllers/customer.controller";
import { QuestionsController } from "./controllers/questions.controller";
import { PrismaService } from "../database/prisma/prisma.service";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [
        CustomerController,
        QuestionsController
    ],
    providers: []
})
export class HttpModule {

}