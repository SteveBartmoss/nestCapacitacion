import axios from 'axios';

export class PokeApiAdapter{

    private readonly axios = axios;

    async getRequest(url: string){
        const {data} = await this.axios.get(url);

        return data
    }

    async postRequest(url: string, data: any){
        return
    }

    async patchRequest(url: string, data: any){
        return
    }

    async deleteRequest(url: string){
        return
    }

}