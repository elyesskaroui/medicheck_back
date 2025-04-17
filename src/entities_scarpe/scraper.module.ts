import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';

@Module({
  //imports: [VideoDownloaderModule], // Add the module here
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}