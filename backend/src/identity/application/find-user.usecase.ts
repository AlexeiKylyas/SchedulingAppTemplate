import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';

@Injectable()
export class FindUserUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userID: string) {
    const user = await this.userRepository.findByID(userID);
    if (!user) throw new UserNotFoundError(userID);
    return user;
  }
}
