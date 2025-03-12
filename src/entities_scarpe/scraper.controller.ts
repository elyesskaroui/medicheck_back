import { Body, Controller, Get, Query } from '@nestjs/common';

import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('start')
  async startScraping(@Query('info') info: string) {
    const results = await this.scraperService.scrapeAllSites(info);
    // Filter results to get only successful scrapes with found=true
    const validResults = results.filter(result => 
      result.data && result.data.found === true
    );
    
    return {
      success: true,
      foundResults: validResults.length > 0,
      results: validResults,
      message: validResults.length > 0 
        ? 'Information verified and found reliable.' 
        : 'Information could not be verified in trusted medical sources.'
    };
  }


  @Get('analyzeimage')
  async analyzeImage(@Query('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      return {
        success: false,
        message: 'Aucune URL d\'image fournie',
      };
    }
    
    try {
      const result = await this.scraperService.analyzeImage(imageUrl);
      
      // Enrichissement de la réponse
      return {
        success: true,
        analysis: {
          related: result.related,
          details: result.details,
          found: result.found,
        },
        message: result.related
          ? 'Cette image est liée au domaine médical ou de la santé.'
          : 'Cette image n\'est PAS liée au domaine médical ou de la santé.',
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de l'analyse de l'image`,
        error: error.message,
        analysis: {
          related: false,
          details: "Impossible d'analyser cette image. Veuillez réessayer avec une autre URL.",
        }
      };
    }
  }





  @Get('/get-analysis-result')
  async getAnalysisResult() {
    return await this.scraperService.getAnalysisResulttext();
  }







  // // POST method to upload video file
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadVideo(@UploadedFile() file: Express.Multer.File) {
  //   try {
  //     // Save file to a local directory (optional)
  //     const filePath = path.join(__dirname, 'uploads', file.originalname);
  //     fs.writeFileSync(filePath, file.buffer);

  //     // Process the uploaded video
  //     const result = await this.analyzeVideo(filePath);

  //     return {
  //       success: true,
  //       message: 'Video uploaded and analyzed successfully.',
  //       analysis: result,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Error during video upload or analysis.',
  //       error: error.message,
  //     };
  //   }
  // }

  @Get('analyzeVideo')
  async analyzeVideo(@Query('videoUrl') videoUrl: string) {
    if (!videoUrl) {
      return {
        success: false,
        message: 'No video URL provided',
      };
    }

    const result = await this.scraperService.analyzeVideo(videoUrl);

    return {
      success: true,
      analysis: result,
      message: result.related
        ? 'The video is related to health.'
        : 'The video is NOT related to health.',
    };
  }







  @Get('analysellll')
  async analyzevideo(@Body('videoUrl') videoUrl: string) {
    try {
      //const videoPath = await this.scraperService.donwloadvideo(videoUrl);
     // console.log("Path of the video is: " + videoPath); // Now you should see the correct path here
      // Pass the videoPath to your analysis method
      // this.scraperService.analyseVideoWithIA(videoPath);
    } catch (error) {
      console.error('Error during video download:', error); // Log any errors
    }
  }
  
  



  }











//function Post(arg0: string): (target: ScraperController, propertyKey: "uploadVideo", descriptor: TypedPropertyDescriptor<(file: Express.Multer.File) => Promise<{ success: boolean; message: string; analysis: { success: boolean; message: string; analysis?: undefined; } | { ...; }; error?: undefined; } | { ...; }>>) => void | TypedPropertyDescriptor<...> {
 // throw new Error('Function not implemented.');
//}