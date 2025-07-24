import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {fileFilter: FileFilter,
    storage: diskStorage({
      destination: './static/uploads'
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File,){
    
    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }

    return file;
  }
}
