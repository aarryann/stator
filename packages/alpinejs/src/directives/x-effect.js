import { skipDuringClone } from '../clone';
import { directive } from '../directives';
import { evaluate, evaluateLater } from '../evaluator'; /// STATOR CUSTOMIZED

directive(
  'effect',
  skipDuringClone((el, { expression }, { effect }) => {
    effect(evaluateLater(el, expression));
  })
);
