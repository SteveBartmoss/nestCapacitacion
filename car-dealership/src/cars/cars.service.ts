import { Injectable, NotFoundException } from '@nestjs/common';
import { Car } from './interfaces/car.interface';
import { v4 as uuid } from 'uuid'; 
import { CreateCarDto } from './dtos/create-car.dto';
import { UpdateCarDto } from './dtos/update-car.dto';

@Injectable()
export class CarsService {

    private cars: Car[] = [
        {
            id: uuid(),
            brand: 'Toyota',
            model: 'Corolla'
        },
        {
            id: uuid(),
            brand: 'Honda',
            model: 'Civic'
        },
        {
            id: uuid(),
            brand: 'Jeep',
            model: 'Cherokee'
        }
    ];

    public findAll(){
        return this.cars
    }

    public findById(id: string){
        const car = this.cars.find(elemet => elemet.id == id);

        if(!car){
            throw new NotFoundException(`Car with id '${id}' not found`);
        }

        return car;
    }

    public createCar(car: CreateCarDto){
        this.cars.push({id: uuid(), brand: car.brand, model: car.model,})

        return 'Car crated :)';
    }

    public updateCar(id: string, car: UpdateCarDto){
        
        let carDB = this.findById(id);

        this.cars = this.cars.map( element => {
            if( element.id === id ){
                carDB = {
                    ...carDB,
                    ...car,
                    id,
                }

                return carDB;
            }

            return element
            
        })
    }

}
