const { MissingParamError, InvalidParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (loadUserEmailRepository) {
    this.loadUserEmailRepository = loadUserEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    if (!this.loadUserEmailRepository) {
      throw new MissingParamError('loadUserEmailRepository')
    }
    if (!this.loadUserEmailRepository.load) {
      throw new InvalidParamError('loadUserEmailRepository')
    }
    await this.loadUserEmailRepository.load(email)
  }
}

const makeSut = () => {
  class LoadUserEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }

  const loadUserEmailRepositorySpy = new LoadUserEmailRepositorySpy()
  const sut = new AuthUseCase(loadUserEmailRepositorySpy)
  return {
    sut,
    loadUserEmailRepositorySpy
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
    const { sut, loadUserEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@mail.com', 'password')

    expect(loadUserEmailRepositorySpy.email).toBe('any_email@mail.com')
  })

  test('Should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@mail.com', 'password')

    expect(promise).rejects.toThrow(new MissingParamError('loadUserEmailRepository'))
  })
  test('Should throw if no LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({})
    const promise = sut.auth('any_email@mail.com', 'password')

    expect(promise).rejects.toThrow(new InvalidParamError('loadUserEmailRepository'))
  })
})
