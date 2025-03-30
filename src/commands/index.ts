import type { R7Command } from '@/class/commands';

import ping from './tools/ping';
import setDailySign from './tools/setDailySign';
import draw from './tools/draw';
import manhuagui_add from './manhuagui/manhuagui_add';
import manhuagui_search from './manhuagui/manhuagui_search';
import manhuagui_hot from './manhuagui/manhuagui_hot';
import setChannel from './tools/setChannel';

export default [ping, setDailySign, draw, manhuagui_add, manhuagui_search, manhuagui_hot, setChannel] as R7Command[];
