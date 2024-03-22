import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@/infra/env/env';
import { AuthModule } from './infra/auth/auth.module';
import { HttpModule } from './infra/http/http.module';
import { EnvService } from './infra/env/env.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    HttpModule,
  ],
  providers: [EnvService],
})
export class AppModule {}
