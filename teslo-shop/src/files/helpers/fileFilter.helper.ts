import { Request } from "express";


export const FileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {

    console.log({file})
    if(!file) return callback( new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1]
    const validExtensions = ['jpg','jpeg','png','gif'];

    if(!validExtensions.includes(fileExtension)){
        return callback(null, false)
    }
   
    callback(null, true);
}