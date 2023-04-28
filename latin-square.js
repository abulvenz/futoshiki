const { random, trunc } = Math;
const { assign, keys } = Object;

const use = (v, fn) => fn(v);
const empty = (arr) => arr.length === 0;
const size = (sq) => sq.length;

const range = (S, N, r = []) =>
  S === N ? r : range(S + (N > S ? 1 : -1), N, [...r, S]);
const flatMap = (arr, fn = (e) => e) =>
  arr.reduce((acc, v) => acc.concat(fn(v)), []);
const column = (mat, cidx) => mat.map((row) => row[cidx]);
const contains = (arr, n) => arr.indexOf(n) >= 0;
const without = (arr, remove) => arr.filter((e) => !contains(remove, e));
const pickRandomly = (arr = []) => arr[trunc(random() * arr.length)];

const shuffle = (arr, r = []) =>
  use(r.length === 0 ? arr.map((e) => e) : arr, (arr_) =>
    arr_.length === 0
      ? r
      : shuffle(arr_, [...r, arr_.splice(trunc(random() * arr_.length), 1)[0]])
  );

const measure = (name) => {
  const t1 = new Date();
  return {
    print: (add = "") => {
      console.log(name + "-" + add, new Date() - t1, "ms");
    },
  };
};

const generate = function (N) {
  const time = measure("generate");
  /**
   * Pick first row randomly.
   */
  const result = [shuffle(range(1, N + 1))];

  const alphabet = range(1, N + 1);

  /**
   * Generate the remaining rows and push them to the result.
   */
  range(1, N).forEach(function (rowidx) {
    /**
     * To each column all numbers of the alphabet can be
     * added that are not already contained.
     */
    const allowedNumbersPerColumn = range(0, N).map((c) =>
      without(alphabet, column(result, c))
    );

    /**
     * Inverse the possibilities: For each number find
     * which columns are still allowed.
     */
    const allowedColumnsPerNumber = alphabet.map((num) =>
      assign({
        num: num,
        columns: allowedNumbersPerColumn
          .map((numbersForColumn, column) =>
            contains(numbersForColumn, num) ? column : undefined
          )
          .filter((e) => e !== undefined),
      })
    );

    let newRow = [];

    const pluck = (fieldName) => (obj) => obj[fieldName];

    const histogram = (arr) =>
      arr.reduce(
        (acc, v) =>
          assign(acc, {
            [v]: (acc[v] || 0) + 1,
          }),
        {}
      );

    /**
     * We will find for each number an allowed position, add
     * it there and remove the number from allowedColumnsPerNumber
     */
    while (!empty(allowedColumnsPerNumber)) {
      /**
       * Find out, if an immediate action has to be taken into account:
       * If a specific column is only allowed for one number, we need to
       * place that number there. Otherwise we might get columns where
       * no numbers can be assigned anymore.
       */
      const histogramOfColumns = histogram(
        flatMap(allowedColumnsPerNumber, pluck("columns"))
      );

      /**
       * Sanitycheck of the histogram. Still possible?
       */
      if (keys(histogramOfColumns).length !== allowedColumnsPerNumber.length) {
        console.error(histogramOfColumns);
        print(result);
        console.log(newRow);
        throw Error("Not solvable anymore");
      }

      let column;
      let next;

      /**
       * If an immediate action is needed, carry it out directly.
       * I.e. select the number and column, where the column only
       * allows for that number. Otherwise we take the number that
       * is allowed in the fewest columns to maximise the
       * number of choices. I'm not sure if this changes anything
       * from a statistical point of view.
       */
      if (
        keys(histogramOfColumns).some((key) => histogramOfColumns[key] === 1)
      ) {
        column = Number(
          keys(histogramOfColumns).filter(
            (key) => histogramOfColumns[key] === 1
          )[0]
        );
        const index = allowedColumnsPerNumber.findIndex((pcan) =>
          contains(pcan.columns, column)
        );
        next = allowedColumnsPerNumber.splice(index, 1)[0];
      } else {
        allowedColumnsPerNumber.sort(
          (a, b) => size(a.columns) - size(b.columns)
        );
        next = allowedColumnsPerNumber.splice(0, 1)[0];
        column = pickRandomly(next.columns);
      }
      allowedColumnsPerNumber.forEach(
        (k) => (k.columns = k.columns.filter((e) => e !== column))
      );
      newRow.push({ num: next.num, column });
    }

    result.push(
      range(0, N).map((i) => newRow.filter((e) => e.column === i)[0].num)
    );
  });
  time.print("total");
  return result;
};

export default generate;
