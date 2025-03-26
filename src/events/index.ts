import type { R7EventHandler } from '@/class/events';

import onButton from './core/onButton';
import onCommand from './core/onCommand';
import onModalSubmit from './core/onModalSubmit';

import ready from './custom/ready';
import subUpdate from './custom/subUpdate';
import dilySign from './custom/dailySign';
import onAutocomplete from './core/onAutocomplete';

export default [onButton, onCommand, onModalSubmit, ready, subUpdate, dilySign, onAutocomplete] as R7EventHandler[];
