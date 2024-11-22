// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  multimodal,
} from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    const model = new openai.realtime.RealtimeModel({
      instructions: `You are a helpful assistant that helps track food consumption. You can record foods eaten and report daily totals for calories and macronutrients (protein, carbs, and fats). You always respond with voice. Never respond with text.`
    });

    const fncCtx: llm.FunctionContext = {
      consumed_food: {
        description: 'Record food consumption in the database',
        parameters: z.object({
          food_name: z.string().describe('The name of the food consumed'),
          calories: z.number().optional().describe('The number of calories in the food'),
          protein: z.number().optional().describe('Grams of protein in the food'),
          carbs: z.number().optional().describe('Grams of carbohydrates in the food'),
          fats: z.number().optional().describe('Grams of fat in the food'),
        }),
        execute: async ({ food_name, calories, protein, carbs, fats }) => {
          console.debug(`recording consumption of ${food_name}`);
          
          try {
            await prisma.foodConsumption.create({
              data: {
                foodName: food_name,
                participantIdentity: participant.identity,
                calories: calories ?? null,
                protein: protein ?? null,
                carbs: carbs ?? null,
                fats: fats ?? null,
              },
            });
            
            // Build response string with available nutritional info
            const nutritionInfo = [
              calories && `${calories} calories`,
              protein && `${protein}g protein`,
              carbs && `${carbs}g carbs`,
              fats && `${fats}g fat`,
            ].filter(Boolean).join(', ');
            
            return `Say: I've recorded that you ate ${food_name}${nutritionInfo ? ` (${nutritionInfo})` : ''}.`;
          } catch (error) {
            console.error('Error recording food consumption:', error);
            throw new Error('Failed to record food consumption');
          }
        },
      },
      
      get_daily_calories: {
        description: 'Get the total calories and macronutrients consumed today',
        parameters: z.object({}),
        execute: async () => {
          try {
            const result = await prisma.foodConsumption.aggregate({
              where: {
                participantIdentity: participant.identity,
                consumedAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
              _sum: {
                calories: true,
                protein: true,
                carbs: true,
                fats: true,
              },
            });
            
            if (!result._sum) {
              return "No food logged today.";
            }

            const totals = {
              calories: result._sum.calories ?? 0,
              protein: result._sum.protein ?? 0,
              carbs: result._sum.carbs ?? 0,
              fats: result._sum.fats ?? 0,
            };
            
            return `Today's totals: ${totals.calories} calories, ${totals.protein.toFixed(1)}g protein, ${totals.carbs.toFixed(1)}g carbs, ${totals.fats.toFixed(1)}g fat.`;
          } catch (error) {
            console.error('Error getting daily nutrition totals:', error);
            throw new Error('Failed to get daily nutrition totals');
          }
        },
      },
    };

    const agent = new multimodal.MultimodalAgent({ model, fncCtx });
    const session = await agent
      .start(ctx.room, participant)
      .then((session) => session as openai.realtime.RealtimeSession);

    session.conversation.item.create(llm.ChatMessage.create({
      role: llm.ChatRole.ASSISTANT,
      text: 'Please greet the user via voice, and ask if they have anything to track.',
    }));

    session.response.create();
    
    // Add event listeners to log the response
    session.on('response_created', (response) => {
      console.log('Response created:', response);
    });
    
    session.on('response_text_delta', (event) => {
      console.log('Response text delta:', event);
    });
    
    session.on('response_done', (response) => {
      console.log('Response completed:', response);
    });
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
