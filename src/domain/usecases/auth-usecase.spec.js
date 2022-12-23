const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true
  return encrypterSpy
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeLoadUserEmailRepository = () => {
  class LoadUserEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }

  const loadUserEmailRepositorySpy = new LoadUserEmailRepositorySpy()
  loadUserEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }
  return loadUserEmailRepositorySpy
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserEmailRepositorySpy = makeLoadUserEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy
  })
  return {
    sut,
    loadUserEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy
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

  test('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserEmailRepositorySpy } = makeSut()
    loadUserEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth('valid_email@mail.com', 'invalid_password')

    expect(accessToken).toBeNull()
  })

  test('Should call Encrypted with correct values', async () => {
    const { sut, loadUserEmailRepositorySpy, encrypterSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'any_password')

    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserEmailRepositorySpy.user.password)
  })

  test('Should call tokenGenerator with correct userId', async () => {
    const { sut, loadUserEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'valid_password')

    expect(tokenGeneratorSpy.userId).toBe(loadUserEmailRepositorySpy.user.id)
  })
  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth('valid_email@mail.com', 'valid_password')

    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('Should throw if an invalid dependencies are provided', async () => {
    const loadUserByEmailRepository = makeLoadUserEmailRepository()
    const encrypter = makeEncrypter()
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({ loadUserByEmailRepository: {} }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: {}
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: null
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: {}
      })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email@mail.com', 'password')
      expect(promise).rejects.toThrow()
    }
  })
})
