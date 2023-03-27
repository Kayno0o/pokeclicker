// ==UserScript==
// @name          [Pokeclicker] Advanced Auto Farmer
// @namespace     Kayno0o Scripts
// @match         https://www.pokeclicker.com/
// @grant         none
// @version       1.0
// @author        Kayno0o
// @description   Add buttons to draw farm layout

// @icon          https://www.google.com/s2/favicons?domain=pokeclicker.com
// @run-at        document-idle

// @homepageURL   https://github.com/Kayno0o/pokeclicker/
// @supportURL    https://github.com/Kayno0o/pokeclicker/issues
// @downloadURL   https://raw.githubusercontent.com/kayno0o/pokeclicker/master/advancedautofarmer.js
// @updateURL     https://raw.githubusercontent.com/kayno0o/pokeclicker/master/advancedautofarmer.js
// ==/UserScript==

function initAdvancedAutoFarm() {
  const customStyle = `
  #drawList {
      padding: 10px
  }
  
  #drawList .plot {
      padding: 2px
  }
  
  #drawList .plot:hover {
      filter: brightness(95%);
      -webkit-filter: brightness(95%)
  }
  
  #drawList .plot:hover .plotLockHover {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex
  }
  
  #drawList .plotLocked {
      opacity: .7
  }
  
  #drawList .plotLockHover {
      display: none;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center
  }
  
  #drawList .plotImage {
      position: relative
  }
  
  #drawList .plotImage .plotSafeLockIcon {
      position: absolute;
      bottom: 5px;
      right: 5px;
      height: 16px;
      width: 16px;
      -webkit-filter: drop-shadow(.2px .2px 0 #000) drop-shadow(-.2px .2px 0 #000) drop-shadow(.2px -.2px 0 #000) drop-shadow(-.2px -.2px 0 #000);
      filter: drop-shadow(.2px .2px 0 #000) drop-shadow(-.2px .2px 0 #000) drop-shadow(.2px -.2px 0 #000) drop-shadow(-.2px -.2px 0 #000)
  }
  
  #drawList .plotButton {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      position: absolute
  }
  `;

  const farmView = document.getElementById("berryFarmView");
  const plotList = document.getElementById("plotList");
  const seeds = farmView.querySelector("#seeds");

  const width = 5;
  const height = 5;

  let autoReplantState =
    localStorage.getItem("aafAutoReplantState") === "1" ? true : false;
  let autoReplantInterval = null;
  let layout = [];
  let drawing = false;

  function plantLayout() {
    layout.forEach((col, x) => {
      col.forEach((berry, y) => {
        if (berry !== -1) App.game.farming.plant(x * width + y, berry);
      });
    });
  }

  function setPlotBerry(plotButton, berry) {
    let img = plotButton.querySelector("img");
    if (img) img.remove();

    if (berry === -1) return;

    img = document.createElement("img");
    plotButton.append(img);

    img.src = FarmController.getBerryImage(berry);
    img.style.height = "100%";
  }

  function setLayoutBerry(x, y) {
    const plot = document.getElementById(`plot-${x}-${y}`);
    const plotButton = plot.querySelector(".plotButton");

    const berry = FarmController.selectedShovel()
      ? -1
      : FarmController.selectedBerry();

    layout[x][y] = berry;
    saveLayout();

    setPlotBerry(plotButton, berry);
  }

  function initOrLoadLayout() {
    if (localStorage.getItem("aafLayout") !== null) {
      let arr = localStorage.getItem("aafLayout").split(",");
      layout = [];

      while (arr.length)
        layout.push(arr.splice(0, width).map((val) => parseInt(val)));
    } else {
      layout = Array(width).fill(Array(height).fill(-1));
      saveLayout();
    }
  }

  function initStyle() {
    let customStyleTag = document.getElementById("aafCustomStyle");
    if (customStyleTag) customStyleTag.remove();

    customStyleTag = document.createElement("style");
    document.body.append(customStyleTag);

    customStyleTag.innerHTML = customStyle;
    customStyleTag.id = "aafCustomStyle";
  }

  function saveLayout() {
    localStorage.setItem("aafLayout", layout.flat().join(","));
  }

  function initGrid() {
    let drawList = farmView.querySelector("#drawList");
    if (drawList) drawList.remove();

    drawList = document.createElement("div");
    plotList.parentElement.append(drawList);

    drawList.id = "drawList";
    drawList.className = "row";
    drawList.padding = "10px";
    drawList.hidden = true;

    layout.forEach((col, x) => {
      const row = document.createElement("div");
      drawList.append(row);

      row.className = "w-100";

      col.forEach((berry, y) => {
        const plot = document.createElement("div");
        drawList.append(plot);

        plot.id = `plot-${x}-${y}`;
        plot.className = "plot col";

        const plotContent = document.createElement("div");
        plot.append(plotContent);

        plotContent.className = "plot-content BerrySelected";

        const plotImage = document.createElement("div");
        plotContent.append(plotImage);

        plotImage.className = "plotImage";

        const img = document.createElement("img");
        plotImage.append(img);

        img.src = "assets/images/farm/soil.png";
        img.style.width = "100%";

        const plotButton = document.createElement("div");
        plotImage.append(plotButton);

        plotButton.className = "plotButton";

        plotButton.addEventListener("click", () => setLayoutBerry(x, y));
        setPlotBerry(plotButton, berry);
      });
    });
  }

  function initButtons() {
    let row = seeds.querySelector("#aafRow");
    if (row) row.remove();

    row = document.createElement("div");
    seeds.append(row);

    row.id = "aafRow";
    row.className = "row justify-content-center py-1 gap-1";

    let drawButton = document.createElement("button");
    row.appendChild(drawButton);

    drawButton.innerHTML = "Draw";
    drawButton.className = "btn btn-danger";
    drawButton.id = "aafDrawingBtn";

    drawButton.addEventListener("click", () => {
      drawing = !drawing;
      drawButton.className = `btn ${drawing ? "btn-success" : "btn-danger"}`;
      plotList.hidden = drawing;
      drawList.hidden = !drawing;
    });

    let autoButton = document.createElement("button");
    row.appendChild(autoButton);

    autoButton.innerHTML = "Auto replant";
    autoButton.className = `btn ${
      autoReplantState ? "btn-success" : "btn-danger"
    }`;
    autoButton.id = "aafAutoBtn";

    autoButton.addEventListener("click", () => {
      autoReplantState = !autoReplantState;
      autoButton.className = `btn ${
        autoReplantState ? "btn-success" : "btn-danger"
      }`;
      autoReplant();
    });
  }

  function autoReplant() {
    if (autoReplantInterval) clearInterval(autoReplantInterval);

    if (autoReplantState) {
      autoReplantInterval = setInterval(() => {
        plantLayout();
      }, 1000);
    }

    localStorage.setItem("aafAutoReplantState", autoReplantState ? "1" : "0");
  }

  initStyle();
  initOrLoadLayout();
  initButtons();
  initGrid();
  autoReplant();
}

function loadScript() {
  let oldInit = Preload.hideSplashScreen;

  Preload.hideSplashScreen = function () {
    let result = oldInit.apply(this, arguments);
    initAdvancedAutoFarm();
    return result;
  };
}

let scriptName = "advancedautofarmer";

if (document.getElementById("scriptHandler") != undefined) {
  let scriptElement = document.createElement("div");
  scriptElement.id = scriptName;
  document.getElementById("scriptHandler").appendChild(scriptElement);
  if (localStorage.getItem(scriptName) != null) {
    if (localStorage.getItem(scriptName) == "true") {
      loadScript();
    }
  } else {
    localStorage.setItem(scriptName, "true");
    loadScript();
  }
} else {
  loadScript();
}
