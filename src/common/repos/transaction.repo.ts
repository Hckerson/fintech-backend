import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class TransactionRepo {
    constructor(private prisma: PrismaService) {}

    async findMany<T extends Prisma.TransactionFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.TransactionFindManyArgs>,
    ) {
        try {
            return await this.prisma.transaction.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find transactions',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
