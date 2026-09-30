import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import type { AuthUser } from '@core/auth/types/auth.types';
import { AccountsService } from './accounts.service';
import { AccountResponseDto } from './dto';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Get()
    @ApiOperation({ summary: "The signed-in member's accounts with balances" })
    @ApiEnvelope(AccountResponseDto, { isArray: true })
    findAll(@CurrentUser() user: AuthUser) {
        return this.accountsService.findAll(user.id);
    }
}
