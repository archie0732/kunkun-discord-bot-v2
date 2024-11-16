import type { R7Command } from '@/class/commands';

import ping from './tools/ping';
import sub from './subcrible/index';
import setDailySign from './tools/setDailySign';
import draw from './tools/draw';

export default [ping, sub, setDailySign, draw] as R7Command[];
