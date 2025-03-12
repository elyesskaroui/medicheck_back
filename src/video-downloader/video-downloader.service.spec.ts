import { Test, TestingModule } from '@nestjs/testing';
import { VideoDownloaderService } from './video-downloader.service';

describe('VideoDownloaderService', () => {
  let service: VideoDownloaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoDownloaderService],
    }).compile();

    service = module.get<VideoDownloaderService>(VideoDownloaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
