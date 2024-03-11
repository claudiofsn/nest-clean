import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Student } from '../../enterprise/entities/student'
import { StudentsRepository } from '../repositories/students-repository'
import { HashGenerator } from '../cryptography/hash-generator'
import { StudentAlreadyExistsError } from './errors/student-already-exists-error'

interface RegisterStundentUseCaseRequest {
    name: string
    email: string
    password: string
}

type RegisterStundentUseCaseResponse = Either<
    StudentAlreadyExistsError,
    {
        student: Student
    }
>

@Injectable()
export class RegisterStundentUseCase {
    constructor(
        private studentsRepository: StudentsRepository,
        private hashGenerator: HashGenerator
    ) { }

    async execute({
        name,
        email,
        password
    }: RegisterStundentUseCaseRequest): Promise<RegisterStundentUseCaseResponse> {
        const emailInUse = await this.studentsRepository.findByEmail(email);

        if (emailInUse) {
            return left(new StudentAlreadyExistsError(email))
        }

        const hashedPassword = await this.hashGenerator.hash(password)

        const student = Student.create({
            name,
            email,
            password: hashedPassword
        })

        await this.studentsRepository.create(student)

        return right({
            student
        })
    }
}
