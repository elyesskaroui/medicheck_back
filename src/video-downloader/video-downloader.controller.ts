import { Body, Controller, Get, Post } from '@nestjs/common';
import { VideoDownloaderService } from './video-downloader.service';

@Controller('video-downloader')
export class VideoDownloaderController {
  constructor(private readonly videoDownloaderService: VideoDownloaderService) {}


  @Post('analysevideo')
  async analyzevideo(@Body('videoUrl') videoUrl: string) {
    try {
      const videoPath = await this.videoDownloaderService.downloadVideo(videoUrl);
     
    } catch (error) {
      console.error('Error during video download:', error); // Log any errors
    }
  }
  


@Get('analysis-result')
async getAnalysis(@Body('videoUrl') videoUrl: string) {
  const result = await this.videoDownloaderService.getAnalysisResult(videoUrl);
  return { success: true, analysis: result };
}









}
