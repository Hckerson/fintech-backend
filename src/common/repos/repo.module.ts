import { UserRepo } from './user.repo';
import { AccountRepo } from './account.repo';
import { TransactionRepo } from './transaction.repo';
import { Global, Module } from '@nestjs/common';

const repos = [UserRepo, AccountRepo, TransactionRepo];

@Global()
@Module({
    providers: repos,
    exports: repos,
})
export class RepoModule {}
