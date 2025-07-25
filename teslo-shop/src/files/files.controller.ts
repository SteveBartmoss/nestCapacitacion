import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(@Res() res: Response, @Param('imageName') imageName: string){

    const path = this.filesService.getStaticProductImage(imageName)

    res.sendFile(path)
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {fileFilter: FileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUlr = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUlr
    };
  }
}
