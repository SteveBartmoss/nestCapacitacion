import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>

  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try{

      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error){
      console.log(error)

      throw new BadRequestException(`code: ${error.code} keyValue: ${JSON.stringify(error.keyValue) } message: ${error.errorResponse.errmsg} `)
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon | null = null;

      if(!isNaN(+term)){
        pokemon = await this.pokemonModel.findOne({no: term});

      }

      if(!pokemon && isValidObjectId(term)){
        pokemon = await this.pokemonModel.findById(term);
      }

      if (!pokemon){
        pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
      }

      if(!pokemon){
        throw new NotFoundException(`Pokemon with id, name or no "${term}" not found `)
      }

      return pokemon;
    
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
