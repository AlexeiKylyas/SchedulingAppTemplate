import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  providers: [ServicesService, ServicesRepository],
  controllers: [ServicesController],
  exports: [ServicesService, ServicesRepository],
})
export class ServicesModule {}
