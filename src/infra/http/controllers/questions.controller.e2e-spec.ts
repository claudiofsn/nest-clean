import { AppModule } from '@/app.module';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('Customer Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('Create a question', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New question',
        content: 'Question content',
      });

    expect(response.statusCode).toBe(201);

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'New question',
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });

  test('Fetch Recent questions', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    await Promise.all([
      questionFactory.makePrismaQuestion({
        authorId: user.id,
        title: 'Question 01',
      }),
      questionFactory.makePrismaQuestion({
        authorId: user.id,
        title: 'Question 02',
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      questions: expect.arrayContaining([
        expect.objectContaining({ title: 'Question 01' }),
        expect.objectContaining({ title: 'Question 02' }),
      ]),
    });
  });

  test('Get Question by Slug', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'Jhon Doe',
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    await questionFactory.makePrismaQuestion({
      authorId: user.id,
      title: 'Question 05',
      slug: Slug.create('question-05'),
    });

    const response = await request(app.getHttpServer())
      .get('/questions/question-05')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      question: expect.objectContaining({ title: 'Question 05' }),
    });
  });

  test('Edit Question', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const questionId = question.id.toString();

    const response = await request(app.getHttpServer())
      .put(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Title',
        content: 'New Content',
      });

    expect(response.statusCode).toBe(204);

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'New Title',
        content: 'New Content',
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });

  test('Delete question', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const questionId = question.id.toString();

    const response = await request(app.getHttpServer())
      .delete(`/questions/${questionId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(204);

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    expect(questionOnDatabase).toBeNull();
  });

  test('Fetch Question Answers', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    await Promise.all([
      answerFactory.makePrismaAnswer({
        authorId: user.id,
        questionId: question.id,
        content: 'Answer 01',
      }),
      answerFactory.makePrismaAnswer({
        authorId: user.id,
        questionId: question.id,
        content: 'Answer 02',
      }),
    ]);

    const questionId = question.id.toString();

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({ content: 'Answer 01' }),
        expect.objectContaining({ content: 'Answer 01' }),
      ]),
    });
  });

  test('Choose question best answer', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    })

    const answerId = answer.id.toString()

    const response = await request(app.getHttpServer())
      .patch(`/questions/${answerId}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        id: question.id.toString(),
      },
    })

    expect(questionOnDatabase?.bestAnswerId).toEqual(answerId)
  })

  test('[POST] /questions/:questionId/answers', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New answer',
      })

    expect(response.statusCode).toBe(201)

    const answerOnDatabase = await prisma.answer.findFirst({
      where: {
        content: 'New answer',
      },
    })

    expect(answerOnDatabase).toBeTruthy()
  })
});
