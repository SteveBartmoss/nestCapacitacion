import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    private readonly pokemonService: PokemonService, //solucion og
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ){}

  async executeSeed(){

    await this.pokemonModel.deleteMany({})

    //let pokeCreate = new CreatePokemonDto()

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    const pokemonToInsert: CreatePokemonDto[] = []

    //const insertPromisesArray: Promise<any>[] = [];

    data.results.forEach((element)=>{

      const segments = element.url.split('/');
      const no = +segments[segments.length-2]

      pokemonToInsert.push({name: element.name, no})

      //await this.pokemonModel.create({name: element.name, no})

      //pokeCreate.name = element.name
      //pokeCreate.no = no

      /*
      insertPromisesArray.push(
        this.pokemonModel.create({name: element.name, no})
      );
      */

    });

    //await Promise.all(insertPromisesArray);

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed';

  }
}
