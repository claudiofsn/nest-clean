import { AppModule } from "@/app.module";
import { INestApplication } from "@nestjs/common";
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe("Customer Controller (e2e)", () => {

    beforeAll(async () => {
        let app: INestApplication

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    test('[POST] /customer/register', async () => {
        await request
    })
})