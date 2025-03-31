import type { R7EventHandler } from '@/class/events';

import onButton from './core/onButton';
import onCommand from './core/onCommand';
import onModalSubmit from './core/onModalSubmit';

import ready from './custom/ready';
import subUpdate from './custom/subUpdate';
import dilySign from './custom/dailySign';
import onAutocomplete from './core/onAutocomplete';
import onSelectMenu from './core/onSelectMenu';
import hoyoSign from './custom/hoyo-sign';

export default [onButton, onCommand, onModalSubmit, ready, subUpdate, dilySign, onAutocomplete, onSelectMenu, hoyoSign] as R7EventHandler[];
