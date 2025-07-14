import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {

  constructor(
    private readonly pokemonService: PokemonService, //solucion og
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  private readonly axios: AxiosInstance = axios;

  async executeSeed(){

    //let pokeCreate = new CreatePokemonDto()

    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')

    data.results.forEach(async (element)=>{

      const segments = element.url.split('/');
      const no = +segments[segments.length-2]

      await this.pokemonModel.create({name: element.name, no})

      //pokeCreate.name = element.name
      //pokeCreate.no = no

      //this.pokemonService.create(pokeCreate)

    })

    return 'Seed Executed';

  }
}
