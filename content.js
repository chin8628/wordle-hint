console.debug("Wordle Hint is started.");

function setHint(msg, win = false) {
  const newHintBox = document.createElement("div");

  newHintBox.setAttribute("id", "wordle-hint-box");
  newHintBox.innerHTML = msg;

  newHintBox.style.border = "1px solid gray";
  newHintBox.style.position = "absolute";
  newHintBox.style.top = "10px";
  newHintBox.style.left = "10px";
  newHintBox.style.padding = "8px";
  newHintBox.style.background = "white";
  newHintBox.style.boxShadow = "0 2px 4px 1px #ddd";

  if (win) {
    newHintBox.style.background = "#6aaa64";
    newHintBox.style.color = "white";
    newHintBox.style.fontSize = "22px";
  }

  const oldHintBox = document.getElementById("wordle-hint-box");
  if (oldHintBox) {
    document.body.removeChild(oldHintBox);
  }

  document.body.appendChild(newHintBox);
}

function getTotalDupFrequency(string) {
  const freq = {};

  for (let i = 0; i < string.length; i++) {
    const character = string.charAt(i);

    if (freq[character]) {
      freq[character]++;
    } else {
      freq[character] = 1;
    }
  }

  let totalFreq = 0;
  Object.values(freq).forEach((alpha) => {
    if (alpha > 1) {
      totalFreq += alpha;
    }
  });

  return totalFreq;
}

function countCommonAlpha(string) {
  let counting = 0;

  string.split("").forEach((i) => {
    if ("aeiourtnsl".split("").includes(i)) {
      counting++;
    }
  });

  return counting;
}

async function findIt() {
  setHint("Opening a dictionary...");
  await new Promise((r) => setTimeout(r, 2000));

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
    } else if (eval === "absent") {
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

  let filteredWords = wordlist.filter((word) => {
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

  filteredWords = filteredWords.sort((left, right) => {
    return getTotalDupFrequency(left) - countCommonAlpha(left) - (getTotalDupFrequency(right) - countCommonAlpha(right));
  });

  console.debug(filteredWords);

  const sliceWords = filteredWords.slice(0, 25);
  let hintMsg = "";
  if (filteredWords.length > 50) {
    sliceWords.forEach((item, index) => {
      if (index < 5) {
        hintMsg += `<strong>${index + 1}. ${item}</strong><br/>`;
      } else {
        hintMsg += `${index + 1}. ${item}<br/>`;
      }
    });

    hintMsg += `+${filteredWords.length - 25} more...`;
    setHint(hintMsg);
  } else if (filteredWords.length > 1) {
    sliceWords.forEach((item, index) => {
      if (index < 5) {
        hintMsg += `<strong>${index + 1}. ${item}</strong><br/>`;
      } else {
        hintMsg += `${index + 1}. ${item}<br/>`;
      }
    });
    setHint(hintMsg);
  } else {
    hintMsg = `<strong>${filteredWords[0]}</strong>`;
    setHint(hintMsg, true);
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
