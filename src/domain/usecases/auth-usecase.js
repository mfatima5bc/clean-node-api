const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor (loadUserEmailRepository, encrypter, tokenGenerator) {
    this.loadUserEmailRepository = loadUserEmailRepository
    this.encrypter = encrypter
    this.tokenGenerator = tokenGenerator
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

    const user = await this.loadUserEmailRepository.load(email)
    if (!user) {
      return null
    }
    const isValid = await this.encrypter.compare(password, user.password)

    if (!isValid) {
      return null
    }

    await this.tokenGenerator.generate(user.id)
  }
}
