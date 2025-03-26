import type { R7Command } from '@/class/commands';

import ping from './tools/ping';
import sub from './subcrible/index';
import setDailySign from './tools/setDailySign';
import draw from './tools/draw';
import manhuagui_add from './manhuagui/manhuagui_add';
import manhuagui_search from './manhuagui/manhuagui_search';

export default [ping, sub, setDailySign, draw, manhuagui_add, manhuagui_search] as R7Command[];
