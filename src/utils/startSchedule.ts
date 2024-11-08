import { readFileSync } from 'fs';
import { resolve } from 'path';
import { scheduleJob } from 'node-schedule';

interface Schedule {
  schedule: {
    time: string;
    repeatDate: string;
    detail: {
      title: string;
      description: string;
    };
  }[];
}

export const scheduleHandler = () => {
  const scheduleData: Schedule = JSON.parse(readFileSync(resolve('resource', 'cache', 'schedule.json'), 'utf-8'));
  scheduleData.schedule.forEach((guild) => {
    guild.plan.forEach((plan) => {

    });
  });
};
