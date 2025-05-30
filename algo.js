// CONFIGS
const MUTATION_RATE = 0.1;
const MUTATION_AMOUNT = 1;
const GENERATIONS = 100;
const POP_SIZE = 50;
const TOP_N = 10;

const cityGrid = [
  [5, 2, 4, 8, 9, 0, 3, 3, 8, 7],
  [5, 5, 3, 4, 4, 6, 4, 1, 9, 1],
  [4, 1, 2, 1, 3, 8, 7, 8, 9, 1],
  [1, 7, 1, 6, 9, 3, 1, 9, 6, 9],
  [4, 7, 4, 9, 9, 8, 6, 5, 4, 2],
  [7, 5, 8, 2, 5, 2, 3, 9, 8, 2],
  [1, 4, 0, 6, 8, 4, 0, 1, 2, 1],
  [1, 5, 2, 1, 2, 8, 3, 3, 6, 2],
  [4, 5, 9, 6, 3, 9, 7, 6, 5, 10],
  [0, 6, 2, 8, 7, 1, 2, 1, 5, 3],
];

function convertCityGridToLocations(grid) {
  const locations = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      locations.push({
        x: col + 0.5,
        y: row + 0.5,
        weight: grid[row][col],
      });
    }
  }
  return locations;
}

function computeCost(candidate, locations) {
  let total = 0;
  for (let loc of locations) {
    const dx = candidate.x - loc.x;
    const dy = candidate.y - loc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const responseTime = 1.7 + 3.4 * distance;
    total += loc.weight * responseTime;
  }
  return total;
}

function generateInitialPopulation(popSize) {
  const population = [];
  for (let i = 0; i < popSize; i++) {
    population.push({
      x: Math.random() * 10,
      y: Math.random() * 10,
    });
  }
  return population;
}

function selectCandidates(population, locations, topN) {
  const evaluated = [];

  for (let i = 0; i < population.length; i++) {
    const candidate = population[i];
    const cost = computeCost(candidate, locations);

    evaluated.push({
      x: candidate.x,
      y: candidate.y,
      cost: cost,
    });
  }
  evaluated.sort((a, b) => a.cost - b.cost);
  return evaluated.slice(0, topN);
}

function crossover(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

function mutate(candidate, rate = MUTATION_RATE, amount = MUTATION_AMOUNT) {
  let newX = candidate.x;
  let newY = candidate.y;

  if (Math.random() < rate) {
    const changeX = (Math.random() * 2 - 1) * amount;
    newX += changeX;
  }

  if (Math.random() < rate) {
    const changeY = (Math.random() * 2 - 1) * amount;
    newY += changeY;
  }

  return {
    x: newX,
    y: newY,
  };
}

function totalWeight(locations) {
  return locations.reduce((sum, loc) => sum + loc.weight, 0);
}

function runGA({
  generations = GENERATIONS,
  popSize = POP_SIZE,
  topN = TOP_N,
  mutationRate = MUTATION_RATE,
  mutationAmount = MUTATION_AMOUNT,
} = {}) {
  const serviceLocations = convertCityGridToLocations(cityGrid);
  let population = generateInitialPopulation(popSize);
  const generationTable = [];
  const totalW = totalWeight(serviceLocations);

  for (let gen = 0; gen < generations; gen++) {
    const top = selectCandidates(population, serviceLocations, topN);
    const best = top[0];
    const avgResponse = best.cost / totalW;

    generationTable.push({
      generation: gen + 1,
      x: best.x.toFixed(2),
      y: best.y.toFixed(2),
      cost: best.cost.toFixed(2),
      avgResponseTime: avgResponse.toFixed(2),
    });

    const newPopulation = [...top];
    while (newPopulation.length < popSize) {
      const p1 = top[Math.floor(Math.random() * topN)];
      const p2 = top[Math.floor(Math.random() * topN)];
      let child = crossover(p1, p2);
      child = mutate(child, mutationRate, mutationAmount);
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  const bestFinal = selectCandidates(population, serviceLocations, 1)[0];

  return {
    bestLocation: { x: bestFinal.x, y: bestFinal.y },
    bestCost: bestFinal.cost,
    generationTable,
    serviceLocations,
  };
}
