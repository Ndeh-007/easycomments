/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const key = "998d11aab7e1480aa2012e453e08f9ce";
const endpoint = "https://api.cognitive.microsofttranslator.com";
const location = "canadacentral";
export async function microsoftTranslate(text: string, target: string, source: string | null = null):Promise<string> { 
    try {
        let res = await axios({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params: {
                'api-version': '3.0',
                // 'from': 'en',
                'to': target
            },
            data: [{
                'text': text,
            }],
            
            responseType: 'json'
        }); 
        return  res.data[0].translations[0].text;
    } catch (error) {
        console.error(error);
        return "Microsoft translate Error";
    }
}