import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { GemService } from './gem.service';
import { OCRServiceextraction } from './ocrextraction';

@Controller('files')
export class GemController {
  constructor(
    private readonly gemService: GemService,
    private readonly ocrServiceExtraction: OCRServiceextraction,
  ) {}

  private lastResponse: any = null; // Variable pour sauvegarder la dernière réponse

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadDir = './upload'; // Dossier local pour stocker les fichiers
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          callback(null, uploadDir);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          const filename = `file-${uniqueSuffix}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      console.log('Uploaded File:', file.filename);

      // Appeler le service pour analyser l'image
      const mediaPath = 'upload';
      const analysisResult = await this.ocrServiceExtraction.analyzeImage(
        mediaPath,
        file.filename,
      );

      // Sauvegarder la réponse
      this.lastResponse = {
        
        analysisResult
      };

      return this.lastResponse;
    } catch (error) {
      console.error('Error in uploadFile:', error.message);

      // Sauvegarder l'erreur pour la rendre accessible au GET
      this.lastResponse = {
        success: false,
        message: 'File upload and analysis failed',
        error: error.message,
      };

      return this.lastResponse;
    }
  }

  @Get()
  async getLastUploadResponse() {
    // Vérifier si une réponse a été sauvegardée
    if (!this.lastResponse) {
      return { success: false, message: 'No file has been uploaded yet' };
    }

    // Retourner la dernière réponse
    return this.lastResponse;
  }
}