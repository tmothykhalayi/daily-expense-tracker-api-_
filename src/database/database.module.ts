import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[
        ConfigModule, TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('PGHOST'),
                port: configService.getOrThrow<number>('PGPORT'),
                username: configService.getOrThrow<string>('PGUSER'),
                password: configService.getOrThrow<string>('PGPASSWORD'),
                database: configService.getOrThrow<string>('PGDATABASE'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: configService.getOrThrow<boolean>('DB_SYNC', true),
                logging: configService.getOrThrow<boolean>('DB_LOGGING', false),
                migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
            }),
            inject: [ConfigService],
        }),
    ]
})
export class DatabaseModule {}
