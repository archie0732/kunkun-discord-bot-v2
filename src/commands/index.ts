import type { R7Command } from '@/class/commands';

import ping from './tools/ping';
import setDailySign from './tools/setDailySign';
import draw from './tools/draw';
import manhuagui_add from './manhuagui/manhuagui_add';
import manhuagui_search from './manhuagui/manhuagui_search';
import manhuagui_hot from './manhuagui/manhuagui_hot';
import setChannel from './tools/setChannel';
import auto_sign from './hoyo/auto_sign';
import nhentai_home from './nhentai/nhentai_home';

export default [ping, setDailySign, draw, manhuagui_add, manhuagui_search, manhuagui_hot, setChannel, auto_sign, nhentai_home] as R7Command[];
