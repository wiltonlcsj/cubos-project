import ModelHelper from '@helpers/ModelHelper';

/**
 * Class that represents a model Rule
 * @class Rule
 */
class Rule implements RuleInterface {
  [key: string]:
    | string
    | number
    | undefined
    | null
    | Date
    | boolean
    | Array<IntervalInterface>
    | Array<number>;

  id: number = ModelHelper.generateId();

  date: string | Date | null = null;

  weekdays: Array<number> | null = null;

  daily = false;

  intervals: Array<IntervalInterface> = [];
}

export default new Rule();
