import { Test, TestingModule } from '@nestjs/testing';
import { VideoDownloaderController } from './video-downloader.controller';
import { VideoDownloaderService } from './video-downloader.service';

describe('VideoDownloaderController', () => {
  let controller: VideoDownloaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoDownloaderController],
      providers: [VideoDownloaderService],
    }).compile();

    controller = module.get<VideoDownloaderController>(VideoDownloaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
