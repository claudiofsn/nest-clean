import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { RegisterStundentUseCase } from './register-student';
import { FakeHasher } from 'test/cryptography/fake-hasher';

let studentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let sut: RegisterStundentUseCase;

describe('Register Student', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository();
    fakeHasher = new FakeHasher();

    sut = new RegisterStundentUseCase(studentsRepository, fakeHasher);
  });

  it('Should be able to register a new student', async () => {
    const result = await sut.execute({
      name: 'Jhon Doe',
      password: '123456',
      email: 'jhon@email.com',
    });

    expect(result.isRight()).toBe(true);

    expect(result.value).toEqual({
      student: studentsRepository.items[0],
    });
  });

  it('Should hash student password upon registration', async () => {
    const result = await sut.execute({
      name: 'Jhon Doe',
      password: '123456',
      email: 'jhon@email.com',
    });

    const hashedPassword = await fakeHasher.hash('123456');

    expect(result.isRight()).toBe(true);
    expect(studentsRepository.items[0].password).toEqual(hashedPassword);
  });
});
