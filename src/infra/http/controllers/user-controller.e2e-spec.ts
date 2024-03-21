import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Customer Controller (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory
      ]
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)

    await app.init()
  })

  test('Register new Customer', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/register')
      .send({
        name: 'John Doe',
        email: 'jhoen@example.com',
        password: '123456',
      })
    expect(response.statusCode).toBe(201)

    const userCreated = await prisma.user.findUnique({
      where: {
        email: 'jhoen@example.com',
      },
    })

    expect(userCreated).toBeTruthy()
  })

  test('Authenticate Customer', async () => {
    await studentFactory.makePrismaStudent({
      email: 'jhondoe@example.com',
      password: await hash('123456', 8),
    })


    const response = await request(app.getHttpServer())
      .get('/user/authenticate?email=jhondoe@example.com&password=123456')
      .send()


    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      accessToken: expect.any(String)
    });
  })
})
