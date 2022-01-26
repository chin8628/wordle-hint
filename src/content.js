console.debug("Wordle Hint is started.");

function injectStyle() {
  const style = document.createElement("style")
  style.innerHTML = `
    #wordle-hint-toggle {
      background: #f6f7f8;
      font-size: 16px;
      box-shadow: 0 2px 5px 1px #ddd;
      border: 1px solid #878A94;
      padding: 4px 8px;
      cursor: pointer;
      position: relative;
    }

    #wordle-hint-toggle:hover {
      background-color: #fff;
      box-shadow: 0 2px 5px 3px #ddd;
    }

    #wordle-hint-toggle:active {
      background: #f6f7f8;
      box-shadow: 0 2px 5px 1px #ddd;
    }

    #wordle-hint-box {
      position: relative;
      margin-top: 8px;
      border: 1px solid gray;
      padding: 8px;
      background: white;
      box-shadow: 0 2px 4px 1px #ddd;
    }

    #wordle-hint-box.win {
      background: #6aaa64;
      color: white;
      fontSize: 22px;
    }

    #wordle-hint-box.hidden {
      display: none;
    }
  `;

  document.head.appendChild(style)
}

function injectExtionsionHTML() {
  const block = document.createElement("div");

  block.innerHTML = `
    <div id="wordle-hint-block" style="position: absolute; top: 10px; left: 10px;">
      <button id="wordle-hint-toggle" type="button">Show</button>
      <div id="wordle-hint-box" class="hidden">
        Press <i>Enter</i> key</br>
        (on your physical keyboard)
      </div>
    </div>
  `;

  document.body.appendChild(block);
}

function handleToggleBtn() {
  const button = document.getElementById("wordle-hint-toggle")
  const cl = document.getElementById("wordle-hint-box").classList
  cl.toggle("hidden")
  
  if (cl.contains("hidden")) {
    button.innerText = "Show"
  } else {
    button.innerText = "Hide"
  }
}

function setHint(msg = "", win = false) {
  const hintBox = document.getElementById("wordle-hint-box");
  hintBox.innerHTML = msg;

  if (win) {
    hintBox.setAttribute("class", "win")
  }
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
    }

    for (const present of revealedAlphas.present) {
      if (word[present.index] == present.alpha) return false;

      if (!word.split("").includes(present.alpha)) return false;
    }

    for (const correct of revealedAlphas.correct) {
      if (word[correct.index] != correct.alpha) return false;
    }

    return true;
  });

  filteredWords = filteredWords.sort((left, right) => {
    return (
      getTotalDupFrequency(left) - countCommonAlpha(left) - (getTotalDupFrequency(right) - countCommonAlpha(right))
    );
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

    hintMsg += `</br>+${filteredWords.length - 25} more...`;
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

injectStyle()
injectExtionsionHTML();

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

document.getElementById("wordle-hint-toggle").addEventListener("click", handleToggleBtn)