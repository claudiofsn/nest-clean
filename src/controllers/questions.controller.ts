import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "src/auth/current-user-decorator";
import { UserPayload } from "src/auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string()
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

const pageQueryParamSchema = z.string().optional().default('1').transform(Number).pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionsController {
    constructor(
        private prisma: PrismaService
    ) { }

    @Post()
    async create(
        @Body(new ZodValidationPipe(createQuestionBodySchema)) { content, title }: CreateQuestionBodySchema,
        @CurrentUser() user: UserPayload
    ) {
        const question = await this.prisma.question.create({
            data: {
                authorId: user.sub,
                title,
                content,
                slug: this.convertToSlug(title)
            }
        })

        return question.id
    }

    @Get()
    async fetchRecentQuestions(
        @Query('page', queryValidationPipe) page: PageQueryParamSchema
    ) {
        const perPage = 1

        const questions = await this.prisma.question.findMany({
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { questions }
    }

    private convertToSlug(title: string) {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
    }

}