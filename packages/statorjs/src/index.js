/**
 *           _
 *     /\   | |     (_)            (_)
 *    /  \  | |_ __  _ _ __   ___   _ ___
 *   / /\ \ | | '_ \| | '_ \ / _ \ | / __|
 *  / ____ \| | |_) | | | | |  __/_| \__ \
 * /_/    \_\_| .__/|_|_| |_|\___(_) |___/
 *            | |                 _/ |
 *            |_|                |__/
 *
 * Let's build Stator together. It's easier than you think.
 * For starters, we'll import Stator's core. This is the
 * object that will expose all of Stator's public API.
 */
import Stator from './main'; /// STATOR CUSTOMIZABLE

/**
 * _______________________________________________________
 * The Evaluator
 * -------------------------------------------------------
 *
 * Now we're ready to bootstrap Stator's evaluation system.
 * It's the function that converts raw JavaScript string
 * expressions like @click="toggle()", into actual JS.
 */
import { normalEvaluator } from './evaluator'; /// STATOR CUSTOMIZABLE

Stator.setEvaluator(normalEvaluator); /// STATOR CUSTOMIZABLE

/**
 * _______________________________________________________
 * The Reactivity Engine
 * -------------------------------------------------------
 *
 * This is the reactivity core of Stator. It's the part of
 * Stator that triggers an element with x-text="message"
 * to update its inner text when "message" is changed.
 */
import { reactive, effect, stop, toRaw } from '@vue/reactivity';

Stator.setReactivityEngine({ reactive, effect, release: stop, raw: toRaw }); /// STATOR CUSTOMIZABLE

/**
 * _______________________________________________________
 * The Magics
 * -------------------------------------------------------
 *
 * Yeah, we're calling them magics here like they're nouns.
 * These are the properties that are magically available
 * to all the Stator expressions, within your web app.
 */
import './magics/index';

/**
 * _______________________________________________________
 * The Directives
 * -------------------------------------------------------
 *
 * Now that the core is all set up, we can register Stator
 * directives like x-text or x-on that form the basis of
 * how Stator adds behavior to an app's static markup.
 */
import './directives/index';

/**
 * _______________________________________________________
 * The Stator Global
 * -------------------------------------------------------
 *
 * Now that we have set everything up internally, anything
 * Stator-related that will need to be accessed on-going
 * will be made available through the "Stator" global.
 */
export default Stator; /// STATOR CUSTOMIZABLE
