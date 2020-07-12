interface RuleInterface {
  [key: string]:
    | string
    | number
    | undefined
    | null
    | Date
    | boolean
    | Array<IntervalInterface>
    | Array<number>;

  id?: number;

  date: string | Date | null;

  weekdays: Array<number> | null;

  daily: boolean;

  intervals: Array<IntervalInterface> | [];
}
