import { AnswerQuestionUseCase } from "@/domain/forum/application/use-cases/answer-question";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { BadRequestException, Body, Controller, Delete, HttpCode, Param, Post, Put } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { EditAnswerUseCase } from "@/domain/forum/application/use-cases/edit-answer";
import { DeleteAnswerUseCase } from "@/domain/forum/application/use-cases/delete-answer";

const answerQuestionBodySchema = z.object({
    content: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(answerQuestionBodySchema)

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>

const editAnswerBodySchema = z.object({
    content: z.string(),
})

const editAnswerBodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema)

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
    constructor(
        private answerQuestion: AnswerQuestionUseCase,
        private editAnswerUseCase: EditAnswerUseCase,
        private deleteAnswerUseCase: DeleteAnswerUseCase
    ) { }

    @Post()
    @HttpCode(204)
    async create(
        @Body(bodyValidationPipe) body: AnswerQuestionBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('questionId') questionId: string,
    ) {
        const { content } = body
        const userId = user.sub

        const result = await this.answerQuestion.execute({
            content,
            questionId,
            authorId: userId,
            attachmentsIds: [],
        })

        if (result.isLeft()) {
            throw new BadRequestException()
        }
    }

    @Put(':answerId')
    @HttpCode(204)
    async editAnswer(
        @Body(editAnswerBodyValidationPipe) body: EditAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('answerId') answerId: string,
    ) {
        const { content } = body
        const userId = user.sub

        const result = await this.editAnswerUseCase.execute({
            content,
            answerId,
            authorId: userId,
            attachmentsIds: [],
        })

        if (result.isLeft()) {
            throw new BadRequestException()
        }
    }

    @Delete(':id')
    @HttpCode(204)
    async deleteAnswer(
        @CurrentUser() user: UserPayload,
        @Param('id') answerId: string,
    ) {
        const userId = user.sub

        const result = await this.deleteAnswerUseCase.execute({
            answerId,
            authorId: userId,
        })

        if (result.isLeft()) {
            throw new BadRequestException()
        }
    }
}