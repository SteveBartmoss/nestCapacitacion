import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  async executeSeed(){
    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10')

    data.results.forEach((element)=>{
      const segments = element.url.split('/');

      const no = +segments[segments.length-2]

      console.log({name: element.name, no: no})

    })

    return data.results;

  }
}
