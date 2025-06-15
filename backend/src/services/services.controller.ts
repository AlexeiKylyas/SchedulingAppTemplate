import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/pagination.dto';
import { Service } from './service.entity';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service has been successfully created',
    type: ServiceResponseDto,
  })
  async create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active services' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active services',
    type: PaginatedResponseDto,
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.servicesService.findAll(paginationDto);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all services (including inactive) - Admin only' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all services',
    type: PaginatedResponseDto,
  })
  async findAllAdmin(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.servicesService.findAllAdmin(paginationDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of service categories',
    type: [String],
  })
  async getCategories(): Promise<string[]> {
    return this.servicesService.getCategories();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get services by category' })
  @ApiParam({ name: 'category', description: 'Service category' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of services in the specified category',
    type: PaginatedResponseDto,
  })
  async findByCategory(
    @Param('category') category: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Service>> {
    return this.servicesService.findByCategory(category, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service found',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async findOne(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service has been successfully updated',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Service has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.servicesService.remove(id);
  }
}