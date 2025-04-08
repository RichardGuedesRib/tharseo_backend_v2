import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { AuthGuard } from '../auth/auth.guard';
import { TokenPayload } from '../auth/dtos/token.payload';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createOrUpdate(
    @Body() createWalletDto: CreateWalletDto,
    @Request() req,
  ) {
    const user = req.user;
    const wallet = await this.walletService.createOrUpdate(
      createWalletDto,
      user,
    );
    return wallet;
  }

  @Get()
  @UseGuards(AuthGuard)
  /**
   * Recupera todas as carteiras associadas ao usuário autenticado.
   *
   * @param req - O objeto de solicitação que contém as informações do usuário autenticado.
   * @returns Uma lista de carteiras do usuário.
   */
  async findAll(@Request() req) {
    const user = req.user;
    const wallets = await this.walletService.findAll(user as TokenPayload);
    return wallets;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  /**
   * Recupera uma carteira específica do usuário autenticado com base no id informado.
   *
   * @param id - O id da carteira a ser recuperada.
   * @param req - O objeto de solicitação que contém as informações do usuário autenticado.
   * @returns A carteira do usuário com base no id informado.
   */
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const wallets = await this.walletService.findOne(id, user as TokenPayload);
    return wallets;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(+id, updateWalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(+id);
  }
}
