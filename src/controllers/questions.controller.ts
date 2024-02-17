import { Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionsController {
    constructor(
    ) { }

    @Post()
    async create() {
        return "ok"
    }

}