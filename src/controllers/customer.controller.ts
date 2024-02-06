import { Body, ConflictException, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { hash } from "bcryptjs";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string()
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/customer')
export class CustomerController {
    constructor(
        private prisma: PrismaService
    ) { }

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createAccountBodySchema))
    async create(@Body() { email, name, password }: CreateAccountBodySchema) {

        const emailInUse = await this.prisma.user.findFirst({
            where: {
                email
            }
        })

        if (emailInUse) {
            throw new ConflictException("User with same email address already exist")
        }

        const hashedPassword = await hash(password, 8)

        await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
    }
}