import Stator from './stator'; /// STATOR CUSTOMIZED

import { evaluator } from './evaluator'; /// STATOR CUSTOMIZED

Stator.setEvaluator(evaluator); /// STATOR CUSTOMIZED

import { reactive, effect, stop, toRaw } from '@vue/reactivity';

Stator.setReactivityEngine({ reactive, effect, release: stop, raw: toRaw }); /// STATOR CUSTOMIZED

import './magics/index';

import './directives/index';

export default Stator; /// STATOR CUSTOMIZED
