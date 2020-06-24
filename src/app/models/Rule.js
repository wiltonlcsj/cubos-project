import { isEqual, isAfter, isBefore, parse, getDay, isWithinRange, eachDay, format } from 'date-fns';

class Rule {
  checkFieldsOnlyOne(body, fields = ['weekdays', 'daily', 'date']) {
    let initialValue = 0;
    return fields.reduce((sum, actual) => {
      return body[actual] !== undefined ? ++initialValue : initialValue;
    }, initialValue) !== 1;
  }

  checkConflict({ date = null, weekdays = null, daily = false, intervals }, array_data) {
    let exists = [];
    for (const interval of intervals) {
      const begin = parse(interval.begin, 'HH:mm', new Date());
      const end = parse(interval.end, 'HH:mm', new Date());

      exists = exists.concat(array_data.filter((item) => {
        return item.intervals.filter((existent_rule_interval) => {
          const existent_begin = parse(existent_rule_interval.begin, 'HH:mm', new Date());
          const existent_end = parse(existent_rule_interval.end, 'HH:mm', new Date());
          return (isBefore(existent_begin, begin) && isAfter(existent_end, end)) ||
            ((isAfter(existent_begin, begin) || isEqual(existent_begin, begin)) && (isBefore(existent_begin, end) || isEqual(existent_begin, end))) ||
            ((isAfter(existent_end, begin) || isEqual(existent_end, begin)) && (isBefore(existent_end, end) || isEqual(existent_end, end)))
        }).length !== 0;
      }));
    }

    const errors = [];
    for (const rule of exists) {
      if (rule.daily || daily) {
        //If some rule of json is daily or current rule is daily
        errors.push({ error: 'One or more rules are daily mode has conflicted intervals' });
        break;
      } else if (rule.weekdays !== null) {
        //If some rule of json has weekdays
        if (date !== null) {
          const dayOfWeek = getDay(parse(date, 'dd-MM-yyyy', new Date()));
          //If new rule date is not null and is equal to one weekday of some rule of json
          if (rule.weekdays.find(item => item == dayOfWeek)) {
            errors.push({ error: 'One or more rules has date conflict on weekdays' });
            break;
          }
        } else if (weekdays !== null) {
          //If date is null and current rule is the same weekday of some rule of json
          if (weekdays.filter((newWeekDay) => {
            return rule.weekdays.find((prevWeekDay) => {
              return prevWeekDay === newWeekDay;
            })
          }).length !== 0) {
            errors.push({ error: 'One or more weekdays has conflicts' });
            break;
          }
        }
      } else if (rule.date !== null) {
        //If the dates are equal
        if (date !== null && date === rule.date) {
          errors.push({ error: 'The dates are the same' });
          break;
        } else if (date === null) {
          const dayOfWeek = getDay(parse(rule.date, 'dd-MM-yyyy', new Date()));
          //If the any rule date is the same weekday of new rule weekdays
          if (weekdays.find(item => item === dayOfWeek)) {
            errors.push({ error: 'The weekdays conflict with one or more rule dates' });
            break;
          }
        }
      }
    }

    return { success: errors.length === 0, errors };
  }

  searchByDates(content, startdate, enddate) {
    const parsedStart = parse(startdate, 'dd-MM-yyyy', new Date());
    const parsedEnd = parse(enddate, 'dd-MM-yyyy', new Date());

    let founded = content.filter((item) => {
      if (item.date !== null) {
        const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
        return isWithinRange(parsedDate, startdate, enddate);
      } else if (item.weekdays !== null) {
        return eachDay(parsedStart, parsedEnd).filter((date) => {
          return item.weekdays.filter((weekday) => {
            return getDay(date) === weekday;
          });
        }).length !== 0;
      }

      return item.daily;
    });

    return eachDay(parsedStart, parsedEnd).map((date) => {
      return {
        day: format(date, 'dd-MM-yyyy'), intervals: founded.filter((item) => {
          return (item.daily) || (item.date !== null && date === item.date) || (item.weekdays.filter((weekday) => {
            return getDay(date) === weekday;
          })).length !== 0;
        }).map((rule) => {
          return rule.intervals;
        })
      }
    })
  }
}

export default new Rule();