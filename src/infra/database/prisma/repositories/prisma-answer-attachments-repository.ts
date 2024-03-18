import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { PrismaService } from "../prisma.service";
import { PrismaAnswerAttachmentMapper } from "../mappers/prisma-answer-attachment-mapper";

export class PrismaAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
        const answerAttachments = await this.prisma.attachment.findMany({
            where: {
                answerId
            }
        })

        return answerAttachments.map(PrismaAnswerAttachmentMapper.toDomain)
    }
    async deleteManyByAnswerId(answerId: string): Promise<void> {
        await this.prisma.attachment.deleteMany({
            where: {
                answerId
            }
        })
    }

}