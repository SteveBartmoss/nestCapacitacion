import axios from 'axios';

export interface HttpAdapter {

    getRequest<T>(url: string):Promise<T>


}

export class PokeApiFetchAdapter implements HttpAdapter {
    async getRequest<T>(url: string): Promise<T>{

        const resp = await fetch(url);
        const data: T = await resp.json();

        return data;

    }
}

export class PokeApiAdapter implements HttpAdapter {

    private readonly axios = axios;

    async getRequest<T>(url: string): Promise<T>{
        const {data} = await this.axios.get<T>(url);

        return data
    }

    async postRequest<T>(url: string, data: any){
        return
    }

    async patchRequest<T>(url: string, data: any){
        return
    }

    async deleteRequest<T>(url: string){
        return
    }

}