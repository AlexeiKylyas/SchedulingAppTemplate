import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';

@Injectable()
export class OtpRepository extends Repository<Otp> {
  constructor(private dataSource: DataSource) {
    super(Otp, dataSource.createEntityManager());
  }

  async createOtp(phoneNumber: string, code: string, expiresInMinutes: number = 5): Promise<Otp> {
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + expiresInMinutes);

    const otp = this.create({
      phoneNumber,
      code,
      expiredAt,
      isUsed: false,
    });

    return this.save(otp);
  }

  async findValidOtp(phoneNumber: string, code: string): Promise<Otp | null> {
    const otp = await this.findOne({
      where: {
        phoneNumber,
        code,
        isUsed: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!otp || otp.isExpired()) {
      return null;
    }

    return otp;
  }

  async markAsUsed(id: string): Promise<void> {
    await this.update(id, { isUsed: true });
  }
}