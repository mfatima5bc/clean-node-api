const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  class LoadUserEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserEmailRepositorySpy = new LoadUserEmailRepositorySpy()
  loadUserEmailRepositorySpy.user = {}
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

  test('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserEmailRepositorySpy } = makeSut()
    loadUserEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.auth('valid_email@mail.com', 'invalid_password')

    expect(accessToken).toBeNull()
  })
})
