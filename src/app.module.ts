import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './user/user.module';
import { ProduitModule } from './produit/produit.module';
import { OrderModule } from './order/order.module';
import { ScraperModule } from './entities_scarpe/scraper.module';
import config from './config/config';
import { GemModule } from './gem/gem.module';
import { VideoDownloaderModule } from './video-downloader/video-downloader.module';
import { AnalyzeModule } from './analyze/analyze.module';
import { ChatModule } from './chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    ScraperModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    ConfigModule.forRoot({
      envFilePath: '.env', 
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RolesModule,
    UserModule,
    ProduitModule,
    OrderModule,
    GemModule,
    VideoDownloaderModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Serve static files from "uploads"
      serveRoot: '/uploads', // URL path prefix
    }),
    AuthModule,
    RolesModule,
    AnalyzeModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
