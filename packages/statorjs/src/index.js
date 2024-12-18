import Stator from './stator';

import { evaluator } from './evaluator';

Stator.setEvaluator(evaluator);

import { reactive, effect, stop, toRaw } from '@vue/reactivity';

Stator.setReactivityEngine({ reactive, effect, release: stop, raw: toRaw });

import './magics/index';

import './directives/index';

export default Stator;
