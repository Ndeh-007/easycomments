import axios from "axios";


export async function scoreTranslation(originalText: string, translatedText: string) {

  try {

    let url = "http://languages.cortical.io/rest/compare?retina_name=en_general"; 
    let _body =  [
      {
        text:originalText
      },
      {
        text:translatedText
      }
    ];
   
    let result = axios.post(url,_body);
    return (await result).data;
  } catch (error:any) {
    console.error("Error scoring Translation \n", error.response.data.message);
  }
}
