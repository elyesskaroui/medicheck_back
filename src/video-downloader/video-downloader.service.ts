import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ScraperService } from 'src/entities_scarpe/scraper.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoDownloaderService {



  private outputFolder = 'videos';

  constructor(private readonly scraperService: ScraperService) {
    if (!fs.existsSync(this.outputFolder)) {
      fs.mkdirSync(this.outputFolder, { recursive: true });
    }
  }

  async downloadVideo(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a unique filename
      const uniqueFilename = `${uuidv4()}.mp4`;
      const outputPath = path.join(this.outputFolder, uniqueFilename);
      const command = `yt-dlp -o "${outputPath}" -f best "${url}"`;

      console.log(`Running command: ${command}`);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Download error: ${stderr}`);
          return reject('Failed to download video.');
        }

        console.log(`Download completed, output: ${stdout}`);

        // Check if the file exists after download
        fs.access(outputPath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error('Error: Video file not found after download.');
            return reject('Video file was not found after download.');
          }


         return  this.scraperService.analysevideowithia(outputPath);
          console.log(`File downloaded successfully: ${outputPath}`);
          //resolve(outputPath); // Resolve with the full path of the downloaded video
        });
      });
    });
  }
  async getAnalysisResult(videoUrl: string) {
    return this.scraperService.getAnalysisResult(videoUrl);
  }


}
