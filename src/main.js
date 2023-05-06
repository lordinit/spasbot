import { Telegraf, 
        session } from "telegraf";
import {message} from "telegraf/filters"

import { code } from "telegraf/format"
import config from 'config'
import { ogg }  from './ogg.js'
import { openai } from './openai.js'

const INITIAL_SESSION = {
    messages:[],
}

console.log(config.get("TEST_ENV"))

const bot = new Telegraf(config.get('TEL_TOKKEN_BOT'))

bot.use(session())

bot.command('new', async (ctx)=>{
    ctx.session = INITIAL_SESSION
    await ctx.reply("Новая Сессия")
})
bot.command('start', async (ctx)=>{
    ctx.session = INITIAL_SESSION
    await ctx.reply("Привет это ChatGpt созданный специально для семьи Спасовых, можешь записать голосовое сообщение или ввести текст , чтобы я придумал новую смешную шутку про штаны Артема")
})

bot.on(message('voice'), async ctx =>{
    try{
        ctx.session ??= INITIAL_SESSION
        await ctx.reply(code("Сообщение принятно,дай подумать..."))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)

        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)

        await ctx.reply(code(`Ты: ${text}`))

        ctx.session.messages.push({role: openai.roles.USER, content:text})


        const response = await openai.chat(ctx.session.messages)


        ctx.session.messages.push({
            role:openai.roles.ASSISTAN , 
            content:response.content })

        await ctx.reply(response.content)

    }catch(e){
        console.log("error", e.message)
    }
})

bot.on(message('text'), async ctx =>{
    try{
        ctx.session ??= INITIAL_SESSION
        await ctx.reply(code("Сообщение принятно,дай подумать..."))

        ctx.session.messages.push({role: openai.roles.USER, content:ctx.message.text})

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role:openai.roles.ASSISTAN , 
            content:response.content })

        await ctx.reply(response.content)

    }catch(e){
        console.log("error", e.message)
    }
})

bot.launch()

process.once("SIGINT", () => bot.stop("SIGINT"))

process.once("SIGTERM", () => bot.stop("SIGTERM"))