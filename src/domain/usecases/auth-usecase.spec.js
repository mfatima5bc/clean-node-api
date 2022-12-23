const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (laodUserEmailRepository) {
    this.laodUserEmailRepository = laodUserEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    await this.laodUserEmailRepository.load(email)
  }
}

const makeSut = () => {
  class LaodUserEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }

  const laodUserEmailRepositorySpy = new LaodUserEmailRepositorySpy()
  const sut = new AuthUseCase(laodUserEmailRepositorySpy)
  return {
    sut,
    laodUserEmailRepositorySpy
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()

    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@mail.com')

    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, laodUserEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@mail.com', 'password')

    expect(laodUserEmailRepositorySpy.email).toBe('any_email@mail.com')
  })
})
