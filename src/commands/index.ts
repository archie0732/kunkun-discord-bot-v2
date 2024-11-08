import type { R7Command } from '@/class/commands';

import ping from './tools/ping';
import sub from './subcrible/index';

export default [ping, sub] as R7Command[];
