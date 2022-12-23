const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
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

    const user = await this.loadUserEmailRepository.load(email)
    if (!user) {
      return null
    }
  }
}
