import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  NotFoundException,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin/admin.guard';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ValidationPipe } from '@nestjs/common';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * Cria um novo ativo no sistema.
   *
   * @param req - O objeto de requisição, que contém informações do usuário.
   * @param data - Os dados necessários para criar um novo ativo.
   *
   * @returns A resposta do serviço de criação de ativos.
   */
  @UseGuards(AuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe())
  @Post()
  create(@Body() data: CreateAssetDto) {
    return this.assetService.create(data);
  }

  /**
   * Retorna todos os ativos cadastrados pelo usuário.
   *
   * @param req - O objeto de requisição, que contém informações do usuário.
   *
   * @returns Uma lista com todos os ativos cadastrados pelo usuário.
   */
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return await this.assetService.findAll();
  }

  /**
   * Retorna um ativo especificado pelo seu ID.
   *
   * @param req - O objeto de requisi o, que cont m informa es do usu rio.
   * @param id - O ID do ativo a ser retornado.
   *
   * @returns O ativo com o ID especificado ou nulo se n o encontrado.
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const asset = await this.assetService.findOne(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }
  /**
   * Atualiza um ativo especificado pelo seu ID.
   *
   * @param req - O objeto de requisi o, que cont m informa es do usu rio.
   * @param id - O ID do ativo a ser atualizado.
   * @param updateAssetDto - Os dados necess rios para atualizar o ativo.
   *
   * @returns O ativo atualizado ou nulo se n o encontrado.
   */
  @UseGuards(AuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe())
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const asset = await this.assetService.findOne(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    const updateAsset = await this.assetService.update(id, updateAssetDto);
    return updateAsset;
  }

  /**
   * Remove um ativo especificado pelo seu ID.
   *
   * @param req - O objeto de requisi o, que cont m informa es do usu rio.
   * @param id - O ID do ativo a ser removido.
   *
   * @returns Nulo se o ativo foi removido com sucesso ou um erro se o ativo n o foi encontrado.
   */
  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const asset = await this.assetService.findOne(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return this.assetService.remove(id);
  }
}
