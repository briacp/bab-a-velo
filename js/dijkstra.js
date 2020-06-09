/*jshint esversion:6 */
// https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
// https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04
const findLowestCostNode = (costs, processed) => {
  const knownNodes = Object.keys(costs);
  
  const lowestCostNode = knownNodes.reduce((lowest, node) => {
      if (lowest === null && !processed.includes(node)) {
        lowest = node;
      }
      if (costs[node] < costs[lowest] && !processed.includes(node)) {
        lowest = node;
      }
      return lowest;
  }, null);

  return lowestCostNode;
};

const findLineIndex = function (pointA, pointB) {
  return data.lines.findIndex(l => (l.start == pointA && l.end == pointB) || (l.end == pointA && l.start == pointB) )
};

const listTrip = (lines) => {
  let li = [];
  let lastPoint;
  lines.forEach( (line, index) => {
    let start;
    let end;
    if (!lastPoint && line.start != lastPoint) {
      start = line.start;
      end = line.end;
    } else {
      start = line.end;
      end = line.start;
    }

    let t = data.points[line.start].label + " <b>\uD83E\uDC0A</b> " + data.points[line.end].label + ": " + line.time + " min";
    li.push("<li class='" + ( index % 2 ? "even" : "odd" ) + "'>" + t + "</li>");

    lastPoint = end;
  });

  document.getElementById("trajectory_detail").innerHTML = li.join("\n");
  document.getElementById("trajectory_detail").style.display = "";
};


const dijkstra = function (startPoint, finishPoint) {
  'use strict';

  console.log(`Trajet ${startPoint} -> ${finishPoint}`);

  // build graph
  const graph = {};
  data.lines.forEach( line => {
    if (!graph[line.start]) {
      graph[line.start] = {};
    }
    if (!graph[line.end]) {
      graph[line.end] = {};
    }

    // XXX take difficulty into account
    graph[line.start][line.end] = line.time;
    graph[line.end][line.start] = line.time;
  });

  if (!graph[startPoint] || !graph[finishPoint]) {
    return null;
  }

  // track lowest cost to reach each node
  const trackedCosts = Object.assign({}, graph[startPoint]);
  trackedCosts[finishPoint] = Infinity;

  // track paths
  const trackedParents = {};
  trackedParents[finishPoint] = null;

  for (let child in graph[startPoint]) {
    trackedParents[child] = startPoint;
  }

  // track nodes that have already been processed
  const processedNodes = [];

  // Set initial node. Pick lowest cost node.
  let node = findLowestCostNode(trackedCosts, processedNodes);
  while (node) {
    let costToReachNode = trackedCosts[node];
    let childrenOfNode = graph[node];
  
    for (let child in childrenOfNode) {
      let costFromNodetoChild = childrenOfNode[child]
      let costToChild = costToReachNode + costFromNodetoChild;
  
      if (!trackedCosts[child] || trackedCosts[child] > costToChild) {
        trackedCosts[child] = costToChild;
        trackedParents[child] = node;
      }
    }
    processedNodes.push(node);

    node = findLowestCostNode(trackedCosts, processedNodes);
  }

  let optimalPath = [finishPoint];
  let parent = trackedParents[finishPoint];

  while (parent != startPoint) {
    optimalPath.push(parent);
    parent = trackedParents[parent];
  }
  optimalPath.push(startPoint);
  optimalPath.reverse();

  let optimalLines = [];
  let lastPoint;
  disableAllLines();
  optimalPath.forEach((p, i) => {
    if (i > 0) {
      let ol = findLineIndex(p, lastPoint);
      optimalLines.push({ start: lastPoint, end: p, time: 10 });
      toggleLine(ol);
    }
    lastPoint = p;
  });
  listTrip(optimalLines);

  const results = {
    time: trackedCosts[finishPoint],
    lines: optimalLines,
    path: optimalPath
  };

  return results;
};
