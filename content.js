console.debug("Wordle Hint is started.");

async function findIt() {
  await new Promise((r) => setTimeout(r, 3000));

  const revealedAlphas = {
    present: [],
    absent: [],
    correct: [],
  };

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

  console.debug(revealedAlphas);

  const filteredWords = wordlist.filter((word) => {
    for (const alpha of word) {
      if (revealedAlphas.absent.includes(alpha)) return false;
      if (!revealedAlphas.present.every((a) => word.includes(a))) return false;

      for (const correct of revealedAlphas.correct) {
        if (word[correct.index] != correct.alpha) return false;
      }
    }

    return true;
  });
}

document.addEventListener(
  "keydown",
  (event) => {
    const keyName = event.key;
    if (keyName !== "Enter") {
      return;
    }

    findIt();
  },
  false
);
