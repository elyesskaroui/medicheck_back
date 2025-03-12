import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import serveStatic from 'serve-static';
import { VideoDownloaderService } from 'src/video-downloader/video-downloader.service';
import * as fs from 'fs';  // Import fs to write to the file
import * as path from 'path';  // To resolve the f
@Injectable()
export class ScraperService {
  private analysisResults: Record<string, string> = {}; // Store results by video URL

  constructor() {}





  analyzeImageFromBase64(imageData: string, mimeType: string) {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(ScraperService.name);

  private browserConfig = {
    headless: true,
  };

  private urls: string[] = [
   "https://www.vidal.fr/",
    "https://www.boiron.com/who-are-we",
    "https://www.who.int",
    "https://pubmed.ncbi.nlm.nih.gov",
    "https://www.mayoclinic.org",
    "https://www.uptodate.com",
    "https://www.cochranelibrary.com",
    "https://www.nih.gov",
    "https://pubmed.ncbi.nlm.nih.gov/clinical/",
  ];


  private apiKey = "AIzaSyAF8BIDiyO4lsLEVofbfYZkGSyULQjfkfA"; 

  private schema = {
    "paragraph": "str",
  };

  // Initialisation correcte de Gemini API
  private genAI = new GoogleGenerativeAI(this.apiKey);
  private model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async scrapeAllSites(info :string): Promise<any[]> {
    this.logger.log('🔍 Scraping started for multiple sites...');

    if (!this.urls || this.urls.length === 0) {
      this.logger.error('⚠ No URLs found to scrape.');
      return [];
    }

    const results = await Promise.all(
      this.urls.map(async (url) => {
        this.logger.log(`🌐 Scraping URL: ${url}`);

        try {
          const result = await this.scrapeSite(url,info);
          this.logger.log(`✅ Scraping Succeeded for ${url}`);
          return {
           
            data: result?.extractedData || null,
          };
        } catch (error) {
          this.logger.error(`❌ Scraping Failed for ${url}: ${error.message}`);
          return {
            url,
            success: false,
            error: error.message,
          };
        }
      })
    );

    return results;
  }

  async scrapeSite(url: string,info : string): Promise<{ extractedData: any, usageInfo: any }> {
    const browser = await puppeteer.launch(this.browserConfig);

    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      const html = await page.content();
     // console.log(`📜 HTML content of ${url}:`, html);

      const extractedData = await this.extractDataWithGemini(html,info);

      const usageInfo = {
        totalTokens: Math.floor(Math.random() * 5000) + 1000,
        promptTokens: Math.floor(Math.random() * 3000) + 500,
        completionTokens: Math.floor(Math.random() * 2000) + 500,
        totalCost: (Math.random() * 0.05).toFixed(4),
      };

      return { extractedData, usageInfo };
    } catch (error) {
      this.logger.error(`❌ Error scraping ${url}: ${error.message}`);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async extractDataWithGemini(html: string,info : string): Promise<any[]> {
    try {
      console.log(info);
      //const info = "Information_médicale"; // Remplacez ceci par l'information médicale spécifique à rechercher

      // const instruction = `Extract all medical information from paragraphs in the HTML. 
      // Search specifically for this information: ' "${info}" '. 
      // Return a JSON response with the format: 
      // {
      //   "found": true/false, 
      //   "data": "extracted data if found", 
      //   "source": "website URL containing the information"
      // }. 
      // Focus only on the provided information. 
      // If found, return the related data and the website that contains it with {"found": true}. 
      // If not found, return {"found": false}.`;

      const instruction = `Analyze the given HTML content and extract all relevant medical information. 
        Compare this information against the provided statement: "${info}". 
        Return a JSON response with the following format:

        {
          "found": true/false,
          "match": true/false, 
          "data": "extracted data if found", 
          "source": "website URL containing the information"
           "accuracy": "percentage of accuracy between the provided statement and the extracted data"
          
          
        }

        - "found": true if relevant data is found, false otherwise. and it must be about the given statment 
        - "match": true if the extracted data confirms that "${info}" is correct, false if it contradicts it.
        - "data": The extracted relevant information.
        - "source": The URL containing the extracted information.
         - "accuracy": A percentage (0% to 100%) indicating how closely the extracted data matches the given statement.

        The accuracy percentage should reflect how well the extracted data supports the given statement. 
        - 100% means the extracted data fully confirms the statement.
        - 0% means the extracted data contradicts the statement.
        - Intermediate values should reflect partial confirmation based on the degree of similarity.

        Ensure the response explicitly states whether the extracted data supports or contradicts the provided information.`;

      
      const prompt = `${instruction}\n\n${html}`;
      
      // Envoi de la requête à Gemini
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        this.logger.error('⚠ Empty response from Gemini API');
        return [];
      }
      try {
        let cleanText = responseText.trim();
    
        // Remove code block indicators like ```json at the start and ```
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    
        let parsed = JSON.parse(cleanText);
        console.log(parsed);
        
        return Array.isArray(parsed) ? parsed.filter(item => item.paragraph) :parsed ;
    } catch (parseError) {
        this.logger.error('❌ Failed to parse Gemini response as JSON: ' + responseText);
        return [];
    }
    
    
    } catch (error) {
      this.logger.error(`❌ Gemini API Error: ${error.message}`);
      throw new Error(`Gemini extraction failed: ${error.message}`);
    }
  }



  /* URL VERIFY API */
  async analyzeImage(imageUrl: string): Promise<{ found: boolean; related: boolean; details: string }> {
    try {
      this.logger.log(`🔍 Analyzing image from URL: ${imageUrl}`);
      
      // Vérifier si l'URL est valide
      if (!imageUrl || !imageUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        return {
          found: false,
          related: false,
          details: "URL d'image invalide. Assurez-vous qu'elle commence par http:// ou https://",
        };
      }
      
      // Ajouter un mécanisme de retry
      let attempt = 0;
      const maxAttempts = 3;
      
      while (attempt < maxAttempts) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // Augmenté à 15 secondes
          
          const imageResp = await fetch(imageUrl, {
            signal: controller.signal,
            headers: { 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
              'Accept': 'image/*'
            },
          });
          
          clearTimeout(timeoutId);
          
          if (!imageResp.ok) {
            throw new Error(`Impossible de récupérer l'image: ${imageResp.status} - ${imageResp.statusText}`);
          }
          
          const contentType = imageResp.headers.get('content-type');
          if (!contentType || !contentType.startsWith('image/')) {
            throw new Error("L'URL ne pointe pas vers une image valide");
          }
          
          const imageBuffer = await imageResp.arrayBuffer();
          const imageData = Buffer.from(imageBuffer).toString('base64');
          
          // Amélioration du prompt pour Gemini
          const instruction = `
            Analysez attentivement cette image et déterminez si elle est liée au domaine médical ou de la santé.
            Recherchez spécifiquement:
            1. Instruments médicaux, équipements hospitaliers ou médicaments
            2. Personnel médical (médecins, infirmières, etc.)
            3. Organes, cellules, structures biologiques
            4. Graphiques ou diagrammes médicaux
            5. Logos d'institutions médicales
            6. Texte ou symboles liés à la médecine
  
            Votre réponse doit être au format JSON exact suivant:
            {
              "description": "description détaillée de l'image",
              "found": true/false,
              "related": true/false,
              "details": "Explication précise des éléments médicaux identifiés ou pourquoi l'image n'est pas médicale",
              "confidence": 0-100
            }`;
          
          // Envoi à Gemini comme dans votre code existant
          const result = await this.model.generateContent([
            {
              inlineData: { data: imageData, mimeType: contentType },
            },
            instruction,
          ]);
          
          let responseText = result.response.text().trim();
          this.logger.log(`✅ Raw Gemini response: ${responseText}`);
          
          responseText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          
          let analysis;
          try {
            analysis = JSON.parse(responseText);
          } catch (parseError) {
            this.logger.error(`Failed to parse Gemini response: ${responseText}`);
            throw new Error(`Invalid JSON response: ${parseError.message}`);
          }
          
          return {
            found: analysis.found || false,
            related: analysis.related || false,
            details: analysis.details || '',
            // Vous pouvez aussi ajouter le champ confidence si souhaité
          };
        } catch (error) {
          attempt++;
          if (attempt >= maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Attente exponentielle
        }
      }
      
      throw new Error("Échec après plusieurs tentatives");
    } catch (error) {
      this.logger.error(`❌ Error analyzing image: ${error.message}`);
      return {
        found: false,
        related: false,
        details: `Failed to analyze image: ${error.message}`,
      };
    }
  }
/******************************* */


  async analyzeVideo(videoUrl: string): Promise<{ found: boolean; related: boolean; details: string }> {
    try {
      this.logger.log(`🔍 Analyzing video: ${videoUrl}`);

      const instruction = `
        Analyze the given video and determine if it is related to health or medicine. 
        Consider elements like medical procedures, healthcare workers, hospitals, medicines, biological illustrations, etc.
        
        Return a JSON response with the format:
        {
          "found": true/false,
          "related": true/false,
          "details": "Explanation of why it is or isn't health-related"
        }.
      `;

      const prompt = `${instruction}\n\nVideo URL: ${videoUrl}`;

      // Call an external AI service to analyze the video content
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        this.logger.error('⚠ Empty response from AI model');
        return { found: false, related: false, details: 'No valid response received.' };
      }

      let cleanText = responseText.trim();
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/```$/, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanText);
        return parsed;
      } catch (parseError) {
        this.logger.error('❌ Failed to parse AI response as JSON');
        return { found: false, related: false, details: 'Failed to process AI response.' };
      }

    } catch (error) {
      this.logger.error(`❌ Video analysis failed: ${error.message}`);
      throw new Error(`Video analysis failed: ${error.message}`);
    }
  }



  










  async analysevideowithia(videoUrl: string) {
    try {
      var ok = true;
      // Initialize GoogleAIFileManager with your GEMINI_API_KEY.
      const fileManager = new GoogleAIFileManager(this.apiKey);
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });
  
      // Upload the file and specify a display name.
      const uploadResponse = await fileManager.uploadFile(videoUrl, {
        mimeType: "video/mp4",
        displayName: "Jupiter's Great Red Spot",
      });
  
      console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
  
      const name = uploadResponse.file.name;
  
      // Poll getFile() on a set interval (10 seconds) to check file state.
      let file = await fileManager.getFile(name);
      while (file.state === FileState.PROCESSING && ok) {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await fileManager.getFile(name);
      }
  
      if (file.state === FileState.FAILED) {
        throw new Error("Video processing failed.");
      }
  
      // When file.state is ACTIVE, the file is ready to be used for inference.
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        { text: "Summarize this video. Then create a quiz with answer key based on the information in the video." },
      ]);
  
      const analysisText = result.response.text();
      console.log("Analysis Result: ", analysisText);
      ok = false;
      // Define the path to save the output file
      const outputPath = path.resolve(__dirname, 'analysisResult.txt');
      
      // Write the result to a .txt file
      fs.writeFileSync(outputPath, analysisText, 'utf8');
  
      console.log("File successfully created at: ", outputPath);
  
      // Wait a moment before reading (optional)
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      // Read the content of the file
      const fileContent = fs.readFileSync(outputPath, 'utf8');
  
      console.log("Extracted Content from File: ", fileContent);
  
      // Return the content of the file
      return { success: true, content: fileContent };
  
    } catch (error) {
      console.error("Error during video analysis:", error);
      return { success: false, error: error.message };
    }
  }










async getAnalysisResult(videoUrl: string) {
  console.log("000000000000000000000000000000000000000000000000000");
  return this.analysisResults[videoUrl] || "Processing or no result available.";
}










async getAnalysisResulttext(): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    // Define the file path
    const outputPath = path.resolve(__dirname, 'analysisResult.txt');

    // Check if the file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error("Analysis result file not found.");
    }

    // Read the file content
    const fileContent = fs.readFileSync(outputPath, 'utf8');

    return { success: true, content: fileContent };
  } catch (error) {
    console.error("Error reading analysis result:", error);
    return { success: false, error: error.message };
  }
}















}
