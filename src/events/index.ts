import type { R7EventHandler } from '@/class/events';

import onButton from './core/onButton';
import onCommand from './core/onCommand';
import onModalSubmit from './core/onModalSubmit';

import ready from './custom/ready';
import subUpdate from './custom/subUpdate';
import dilySign from './custom/dailySign';

export default [onButton, onCommand, onModalSubmit, ready, subUpdate, dilySign] as R7EventHandler[];
