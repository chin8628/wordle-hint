console.debug("Wordle Hint is started.");

const revealedAlphas = {
  present: [],
  absent: [],
  correct: [],
};

window.addEventListener("load", (event) => {
  const gamerows = document.body
    .querySelector("game-app")
    .shadowRoot.querySelectorAll("game-theme-manager #game game-row:not([letters=''])");

  const revealedTiles = [];
  Array(...gamerows).forEach((row) => {
    revealedTiles.push(...row.shadowRoot.querySelectorAll("game-tile"));
  });

  revealedTiles.forEach((tile) => {
    const alpha = tile.getAttribute("letter");
    const eval = tile.getAttribute("evaluation");
    if (eval === "correct") {
      revealedAlphas["correct"].push({
        index: revealedTiles.indexOf(tile) % 5,
        alpha,
      });
    } else {
      revealedAlphas[eval].push(alpha);
    }
  });
});
