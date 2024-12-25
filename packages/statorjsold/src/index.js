import Stator from './stator'; /// STATOR CUSTOMIZED

import { normalEvaluator } from './evaluator'; /// STATOR CUSTOMIZED

Stator.setEvaluator(normalEvaluator); /// STATOR CUSTOMIZED

import { reactive, effect, stop, toRaw } from '@vue/reactivity';

Stator.setReactivityEngine({ reactive, effect, release: stop, raw: toRaw }); /// STATOR CUSTOMIZED

import './magics/index';

import './directives/index';

export default Stator; /// STATOR CUSTOMIZED
