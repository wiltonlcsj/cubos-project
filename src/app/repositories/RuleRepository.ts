import {
  isEqual,
  isAfter,
  isBefore,
  parse,
  getDay,
  eachDayOfInterval,
  format,
} from 'date-fns';

class RuleRepository {
  /**
   * Function that searches and returns a list with schedules in dates parameters interval
   * @param {Array<RuleInterface>} content Arrange set of existing schedules
   * @param {string} startdate Start date of filter in format dd-MM-yyyy
   * @param {string} enddate End date of filter in format dd-MM-yyyy
   * @returns {Array<object>} A array with all days that has schedule on dates interval
   * @memberof Rule
   */
  searchByDates(
    content: Array<RuleInterface>,
    startdate: string,
    enddate: string,
  ) {
    const parsedStart = parse(startdate, 'dd-MM-yyyy', new Date());
    const parsedEnd = parse(enddate, 'dd-MM-yyyy', new Date());

    /*
     * 1. Iterates over each day in startdate and enddate interval
     * 2. Check for each day if it has a schedule
     * 3. Mount the object to response
     */
    return eachDayOfInterval({ start: parsedStart, end: parsedEnd })
      .map(date => {
        const formattedDate = format(date, 'dd-MM-yyyy');
        const intervals = content
          .filter(item => {
            return (
              item.daily ||
              (item.date !== null && formattedDate === item.date) ||
              (item.weekdays !== null &&
                item.weekdays.filter(weekday => {
                  return getDay(date) === weekday;
                }).length !== 0)
            );
          })
          .map(rule => {
            return rule.intervals;
          });

        let concatIntervals: Array<IntervalInterface> = [];
        intervals.forEach(element => {
          concatIntervals = concatIntervals.concat(element);
        });

        /*
         * 1. Change name of attribute begin to start
         * 2. Order schedule by time asc
         * 3. Remove dates that doesn't has a schedule
         */
        const orderdedIntervals = concatIntervals
          .map(item => {
            return { start: item.begin, end: item.end };
          })
          .sort((a, b) => {
            const parsedcurrent = parseInt(a.start.replace(/:/, ''), 10);
            const parsednext = parseInt(b.start.replace(/:/, ''), 10);

            if (parsedcurrent < parsednext) return -1;

            if (parsedcurrent > parsednext) return 1;

            return 0;
          });

        return {
          day: format(date, 'dd-MM-yyyy'),
          intervals: orderdedIntervals,
        };
      })
      .filter(intervalDate => intervalDate.intervals.length !== 0);
  }

  /**
   * Function that checks if exists a schedule conflict if the new Rule be saved
   * @param {object} { date = null, weekdays = null, daily = false, intervals } object with fields to new rule
   * @param {Array<RuleInterface>} arrayData Array of existing objects from json
   * @returns {object} Returns a object with success attribute that indicates if exists a schedule conflict
   * @memberof Rule
   */
  checkConflict(
    { date = null, weekdays = null, daily = false, intervals }: RuleInterface,
    arrayData: Array<RuleInterface>,
  ) {
    let exists: Array<RuleInterface> = [];
    intervals.forEach(interval => {
      const begin = parse(interval.begin, 'HH:mm', new Date());
      const end = parse(interval.end, 'HH:mm', new Date());

      // Get the rules that has the same time from new Rule to be saved
      exists = exists.concat(
        arrayData.filter(item => {
          return (
            item.intervals.filter(existentRuleInterval => {
              const existentBegin = parse(
                existentRuleInterval.begin,
                'HH:mm',
                new Date(),
              );
              const existentEnd = parse(
                existentRuleInterval.end,
                'HH:mm',
                new Date(),
              );
              return (
                (isBefore(existentBegin, begin) && isAfter(existentEnd, end)) ||
                ((isAfter(existentBegin, begin) ||
                  isEqual(existentBegin, begin)) &&
                  (isBefore(existentBegin, end) ||
                    isEqual(existentBegin, end))) ||
                ((isAfter(existentEnd, begin) || isEqual(existentEnd, begin)) &&
                  (isBefore(existentEnd, end) || isEqual(existentEnd, end)))
              );
            }).length !== 0
          );
        }),
      );
    });

    const errors: Array<{ error: string }> = [];
    exists.some(rule => {
      if (rule.daily || daily) {
        // If some rule of json is daily or current rule is daily
        errors.push({
          error: 'One or more rules are daily mode has conflicted intervals',
        });
        return true;
      }
      if (rule.weekdays !== null) {
        // If some rule of json has weekdays
        if (date !== null) {
          const dayOfWeek = getDay(
            parse(date as string, 'dd-MM-yyyy', new Date()),
          );
          // If new rule date is not null and is equal to one weekday of some rule of json
          if (rule.weekdays.find(item => item === dayOfWeek)) {
            errors.push({
              error: 'One or more rules has date conflict on weekdays',
            });
            return true;
          }
        } else if (weekdays !== null) {
          // If date is null and current rule is the same weekday of some rule of json
          if (
            weekdays.filter(newWeekDay => {
              if (rule.weekdays) {
                return rule.weekdays.find(prevWeekDay => {
                  return prevWeekDay === newWeekDay;
                });
              }

              return false;
            }).length !== 0
          ) {
            errors.push({ error: 'One or more weekdays has conflicts' });
            return true;
          }
        }
      } else if (rule.date !== null) {
        // If the dates are equal
        if (date !== null && date === rule.date) {
          errors.push({ error: 'The dates are the same' });
          return true;
        }
        if (date === null) {
          const dayOfWeek = getDay(
            parse(rule.date as string, 'dd-MM-yyyy', new Date()),
          );
          // If the any rule date is the same weekday of new rule weekdays
          if (weekdays) {
            if (weekdays.find(item => item === dayOfWeek)) {
              errors.push({
                error: 'The weekdays conflict with one or more rule dates',
              });
              return true;
            }
          }
        }
      }
      return false;
    });

    return { success: errors.length === 0, errors };
  }
}

export default new RuleRepository();
