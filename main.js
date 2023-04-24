import m from "mithril";
import { a, br, button, div, h1 } from "./tags";
import generate from "./latin-square";

const range = (N) => {
  const r = [];
  for (let i = 0; i < N; i++) {
    r.push(i);
  }
  return r;
};

const createGame = (squareSize = 4) => {
  const values = generate(squareSize);

  const horizontal = range(squareSize).map((row, ridx) =>
    range(squareSize - 1).map((field, cidx) => ({
      ridx,
      cidx,
      value: values[ridx][cidx] > values[ridx][cidx + 1],
    }))
  );
  const vertical = range(squareSize - 1).map((row, ridx) =>
    range(squareSize).map((field, cidx) => ({
      ridx,
      cidx,
      value: values[ridx][cidx] > values[ridx + 1][cidx],
    }))
  );
  console.log(horizontal);

  const rows = range(squareSize).map((ridx) =>
    range(squareSize).map((cidx) => ({
      ridx,
      cidx,
      init: values[ridx][cidx],
      value: undefined,
    }))
  );
  return {
    squareSize,
    rows: () => rows,
    horizontal: () => horizontal,
    vertical: () => vertical,
  };
};

let game = createGame(3);
let percent = 80;

m.mount(document.body, {
  view: (vnode) =>
    div.container([
      h1("Futoshiki"),
      game === null
        ? [
            button({ onclick: () => (game = createGame()) }, "Create Game"),
            br(),
          ]
        : div.board(
            {
              style: `
                --width: min(${percent}vh,${percent}vw);
                --height: min(${percent}vh,${percent}vw);
                --col:${game.squareSize};
                --row:${game.squareSize};
                --col-1:${game.squareSize - 1};
                --row-1:${game.squareSize - 1};
                --gap:2px;
            `,
            },
            game
              .rows()
              .map((row, ridx) => [
                row.map((field, cidx) => [
                  div.box(`${field.init}`),
                  cidx !== row.length - 1
                    ? div.between[
                        game.horizontal()[ridx][cidx].value === true
                          ? "arrow-right"
                          : game.horizontal()[ridx][cidx].value === false
                          ? "arrow-left"
                          : ""
                      ]()
                    : null,
                ]),
                ridx !== game.squareSize - 1
                  ? range(game.squareSize).map((c, cidx) => [
                      div.beneath[
                        game.vertical()[ridx][cidx].value === true
                          ? "arrow-down"
                          : game.vertical()[ridx][cidx].value === false
                          ? "arrow-up"
                          : ""
                      ](),
                      cidx !== game.squareSize - 1 ? div.crossing() : null,
                    ])
                  : null,
              ])
          ),
      a.mt5(
        { href: "https://github.com/abulvenz/futoshiki/" },
        "Source Code on github"
      ),
    ]),
});
