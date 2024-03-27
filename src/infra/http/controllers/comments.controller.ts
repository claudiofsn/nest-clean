import { CommentOnAnswerUseCase } from "@/domain/forum/application/use-cases/comment-on-answer";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { BadRequestException, Body, Controller, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";

const commentOnAnswerBodySchema = z.object({
    content: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(commentOnAnswerBodySchema)

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>

@Controller()
export class CommentsController {
    constructor(
        private commentOnAnswerUseCase: CommentOnAnswerUseCase
    ) { }

    @Post('/answers/:answerId/comments')
    async commentOnAnswer(
        @Body(bodyValidationPipe) body: CommentOnAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('answerId') answerId: string,
    ) {
        const { content } = body
        const userId = user.sub

        const result = await this.commentOnAnswerUseCase.execute({
            content,
            answerId,
            authorId: userId,
        })

        if (result.isLeft()) {
            throw new BadRequestException()
        }

    }
}