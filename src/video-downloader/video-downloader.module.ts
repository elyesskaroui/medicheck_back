import { Module } from '@nestjs/common';
import { VideoDownloaderService } from './video-downloader.service';
import { VideoDownloaderController } from './video-downloader.controller';
import { ScraperService } from 'src/entities_scarpe/scraper.service';
import { ScraperModule } from 'src/entities_scarpe/scraper.module';

@Module({
  imports: [ScraperModule], // Add the module here

  controllers: [VideoDownloaderController],
  providers: [VideoDownloaderService,ScraperService]
})
export class VideoDownloaderModule {}
