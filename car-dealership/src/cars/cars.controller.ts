import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dtos/create-car.dto';
import { UpdateCarDto } from './dtos/update-car.dto';

@Controller('cars')
export class CarsController {

    constructor(
        private readonly carsService: CarsService
    ){}

    @Get()
    getAllCars(){
        return this.carsService.findAll();
    }

    @Get(':id')
    getCarById( @Param('id', ParseUUIDPipe) id){
        return this.carsService.findById(id);
    }

    @Post()
    createCar(@Body() createCarDto: CreateCarDto){
        return this.carsService.createCar(createCarDto)
    }

    @Patch(':id')
    updateCar(@Param('id', ParseUUIDPipe) id, @Body() updateCarDto: UpdateCarDto){
        return this.carsService.updateCar(id,updateCarDto)
    }

    @Delete(':id')
    deleteCar(@Param('id') id){
        return this.carsService.deleteCar(id)
    }
}