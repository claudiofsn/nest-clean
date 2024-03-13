import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { FakeEncrypter } from "test/cryptography/fake-encrypter"
import { AuthenticateStundentUseCase } from "./authenticate-student"
import { makeStudent } from "test/factories/make-student"

let studentsRepository: InMemoryStudentsRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateStundentUseCase

describe('Register Student', () => {
    beforeEach(() => {
        studentsRepository = new InMemoryStudentsRepository()
        fakeHasher = new FakeHasher()
        fakeEncrypter = new FakeEncrypter()

        sut = new AuthenticateStundentUseCase(studentsRepository, fakeHasher, fakeEncrypter)
    });

    it('Should be able to authenticate a student', async () => {
        const student = makeStudent({
            email: "jhon@email.com",
            password: await fakeHasher.hash("123456")
        })

        studentsRepository.items.push(student)

        const result = await sut.execute({
            email: "jhon@email.com",
            password: "123456"
        });

        expect(result.isRight()).toBe(true);

        expect(result.value).toEqual({
            accessToken: expect.any(String)
        })
    })

    /* it('Should hash student password upon registration', async () => {
         const result = await sut.execute({
             name: "Jhon Doe",
             password: "123456",
             email: "jhon@email.com"
         });
 
         const hashedPassword = await fakeHasher.hash("123456")
 
         expect(result.isRight()).toBe(true);
         expect(studentsRepository.items[0].password).toEqual(hashedPassword)
     })*/
})