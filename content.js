console.debug("Wordle Hint is started.");

function setHint(msg) {
  const newHintBox = document.createElement("div");

  newHintBox.setAttribute("id", "wordle-hint-box");
  newHintBox.innerHTML = msg;

  newHintBox.style.border = "1px solid gray";
  newHintBox.style.position = "absolute";
  newHintBox.style.top = "10px";
  newHintBox.style.left = "10px";
  newHintBox.style.padding = "8px";
  newHintBox.style.boxShadow = "0 2px 4px 1px #ddd";

  const oldHintBox = document.getElementById("wordle-hint-box");
  if (oldHintBox) {
    document.body.removeChild(oldHintBox);
  }

  document.body.appendChild(newHintBox);
}

async function findIt() {
  setHint("Opening a dictionary...");
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
      revealedAlphas.correct.push({
        index: revealedTiles.indexOf(tile) % 5,
        alpha,
      });
    } else if (eval === "present") {
      revealedAlphas.present.push({
        index: revealedTiles.indexOf(tile) % 5,
        alpha,
      });
    } else {
      revealedAlphas.absent.push(alpha);
    }
  });

  revealedAlphas.absent = revealedAlphas.absent.filter((item) => {
    if (
      [
        ...revealedAlphas.correct.map((item) => item.alpha),
        ...revealedAlphas.present.map((item) => item.alpha),
      ].includes(item)
    ) {
      return false;
    }

    return true;
  });

  console.debug(revealedAlphas);

  const filteredWords = wordlist.filter((word) => {
    for (const alpha of word) {
      if (revealedAlphas.absent.includes(alpha)) return false;

      for (const present of revealedAlphas.present) {
        if (word[present.index] == present.alpha) return false;
      }

      for (const correct of revealedAlphas.correct) {
        if (word[correct.index] != correct.alpha) return false;
      }
    }

    return true;
  });

  if (filteredWords.length > 50) {
    setHint(filteredWords.slice(0, 25).join("<br/>"));
  } else {
    setHint(filteredWords.join("<br/>"));
  }
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
