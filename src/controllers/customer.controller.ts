import { Body, ConflictException, Controller, HttpCode, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('/customer')
export class CustomerController {

    constructor(
        private prisma: PrismaService
    ) { }

    @Post()
    @HttpCode(201)
    async create(@Body() { email, name, password }: { name: string; email: string; password: string }) {

        const emailInUse = await this.prisma.user.findFirst({
            where: {
                email
            }
        })

        if (emailInUse) {
            throw new ConflictException("User with same email address already exist")
        }

        await this.prisma.user.create({
            data: {
                name,
                email,
                password
            }
        })
    }
}