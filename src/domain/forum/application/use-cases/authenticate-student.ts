import { Either, left, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { StudentsRepository } from '../repositories/students-repository';
import { HashComparer } from '../cryptography/hash-comparer';
import { Encrypter } from '../cryptography/encrypter';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';

interface AuthenticateStundentUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateStundentUseCaseResponse = Either<
  InvalidCredentialsError,
  {
    accessToken: string;
  }
>;

@Injectable()
export class AuthenticateStundentUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private hashCompare: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateStundentUseCaseRequest): Promise<AuthenticateStundentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email);

    if (!student) {
      return left(new InvalidCredentialsError());
    }

    const isValidPassword = await this.hashCompare.compare({
      plain: password,
      hash: student.password,
    });

    if (!isValidPassword) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: student.id.toString(),
    });

    return right({
      accessToken,
    });
  }
}
