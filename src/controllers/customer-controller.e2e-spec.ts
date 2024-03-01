import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from '@nestjs/testing'
import { hash } from "bcryptjs";
import request from 'supertest'

describe("Customer Controller (e2e)", () => {
    let app: INestApplication
    let prisma: PrismaService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService)

        await app.init();
    });

    test('Register new Customer', async () => {
        const response = await request(app.getHttpServer()).post('/customer/register').send({
            name: 'John Doe',
            email: 'jhoen@example.com',
            password: '123456'
        });

        expect(response.statusCode).toBe(201)

        const userCreated = await prisma.user.findUnique({
            where: {
                email: 'jhoen@example.com'
            }
        });

        expect(userCreated).toBeTruthy();
    })

    test('Authenticate Customer', async () => {
        await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'jhondoe@example.com',
                password: await hash('123456', 8)
            }
        })

        const response = await request(app.getHttpServer()).get('/customer/authenticate?email=jhondoe@example.com&password=123456').send();

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
            accessToken: expect.any(String)
        })

    })
})