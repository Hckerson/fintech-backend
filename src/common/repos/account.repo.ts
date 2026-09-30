import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class AccountRepo {
    constructor(private prisma: PrismaService) {}

    async findMany<T extends Prisma.AccountFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.AccountFindManyArgs>,
    ) {
        try {
            return await this.prisma.account.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find accounts',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
