import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import type { AuthUser } from '@core/auth/types/auth.types';
import { CashFlowService } from './cash-flow.service';
import { CashFlowQueryDto, CashFlowSeriesResponseDto } from './dto';

@ApiTags('cash-flow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-flow')
export class CashFlowController {
    constructor(private readonly cashFlowService: CashFlowService) {}

    @Get()
    @ApiOperation({
        summary: 'Posted inflow, outflow and net per period in one currency',
    })
    @ApiEnvelope(CashFlowSeriesResponseDto)
    series(@CurrentUser() user: AuthUser, @Query() query: CashFlowQueryDto) {
        return this.cashFlowService.series(user.id, query);
    }
}
