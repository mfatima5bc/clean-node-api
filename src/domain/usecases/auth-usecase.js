const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor (loadUserEmailRepository, encrypter) {
    this.loadUserEmailRepository = loadUserEmailRepository
    this.encrypter = encrypter
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
    await this.encrypter.compare(password, user.password)
    return null
  }
}
