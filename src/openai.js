import { Configuration, OpenAIApi } from "openai"
import config from 'config'
import { createReadStream } from "fs"
import axios from "axios"


class OpenAI {
    roles = {
        ASSISTAN: "assistant",
        USER: "user",
        SYSTEM:"system",
    }



    constructor(apiKey){
        const configuration = new Configuration({
            apiKey,
          });
        this.openai = new OpenAIApi(configuration);
    }

    async chat(messages){
        try {
          const response = await this.openai.createChatCompletion({
            model:'gpt-3.5-turbo',
            messages,
          })
          return response.data.choices[0].message
        } catch (e) {
          console.log("error while chat", e.message)
          return undefined // добавляем возврат undefined в случае ошибки
        }
      }

    async transcription(filelpath){
        try {
            const response = await this.openai.createTranscription(
                createReadStream(filelpath),
                "whisper-1"
            )
            return response.data.text
        } catch (e) {
            console.log("error while transcription ", e.message)
            
        }
    }

    async image(prompt) {
      try {
        const responseImage = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'image-alpha-001',
          prompt: prompt,
        }, {
          headers: {
            Authorization: `Bearer ${config.get('OpenAIKey')}`, 
            'Content-Type': 'application/json',
          },
        });
        return responseImage
      } catch (e) {
        console.error(e);
      }
    }
  }

export const openai = new OpenAI(config.get("OpenAIKey"))