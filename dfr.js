const fs = require("fs");

// Function to check if file exists
function fileExists(filename) {
  return fs.existsSync(filename);
}

// Function to check if a value is a valid number
function validNumber(value) {
  return typeof value === "number" || 
         (typeof value === "string" && /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(value));
}

// Function to find the dimensions of a dataset or dataframe
function dataDimensions(data) {
  if (!data) return [-1, -1];
  if (Array.isArray(data[0])) return [data.length, data[0].length];
  if (Array.isArray(data)) return [data.length, -1];
  return [-1, -1];
}

// Function to sum all valid numbers in a dataset
function findTotal(dataset) {
  if (!Array.isArray(dataset) || dataset.some(Array.isArray)) return 0;

  return dataset.reduce((sum, item) => sum + (validNumber(item) ? parseFloat(item) : 0), 0);
}

// Function to calculate the mean of a dataset
function calculateMean(dataset) {
  if (!Array.isArray(dataset) || dataset.some(Array.isArray)) return 0;

  const numbers = dataset.filter(validNumber).map(parseFloat);
  return numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
}

// Function to calculate the median of a dataset
function calculateMedian(dataset) {
  if (!Array.isArray(dataset) || dataset.some(Array.isArray)) return 0;

  const numbers = dataset.filter(validNumber).map(parseFloat).sort((a, b) => a - b);
  if (!numbers.length) return 0;
  
  const mid = Math.floor(numbers.length / 2);
  return numbers.length % 2 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;
}

// Function to convert strings in a specified column to numbers
function convertToNumber(dataframe, col) {
  if (!Array.isArray(dataframe) || !dataframe.length || col < 0) return 0;

  let convertedCount = 0;
  for (let i = 1; i < dataframe.length; i++) {
    if (validNumber(dataframe[i][col])) {
      dataframe[i][col] = parseFloat(dataframe[i][col]);
      convertedCount++;
    }
  }
  return convertedCount;
}

// Function to flatten a single-column dataframe into a dataset
function flatten(dataframe) {
  const [rows, cols] = dataDimensions(dataframe);
  if (cols !== 1) return [];
  
  return dataframe.map(row => row[0]);
}

// Function to load a CSV file into a dataframe, ignoring specified rows/columns
function loadCSV(csvFile, ignoreRows = [], ignoreCols = []) {
  if (!fileExists(csvFile)) return [[], -1, -1];

  const data = fs.readFileSync(csvFile, "utf-8").trim().split("\n").map(row => row.split(","));
  const totalRows = data.length;
  const totalColumns = data[0].length;

  const filteredData = data
    .filter((_, rowIdx) => !ignoreRows.includes(rowIdx))
    .map(row => row.filter((_, colIdx) => !ignoreCols.includes(colIdx)));

  return [filteredData, totalRows, totalColumns];
}

// Function to create a slice of the dataframe based on a column pattern and export columns
function createSlice(dataframe, columnIndex, pattern, exportColumns = []) {
  if (!Array.isArray(dataframe) || columnIndex < 0) return [];

  return dataframe
    .filter(row => pattern === "*" || row[columnIndex] === pattern)
    .map(row => (exportColumns.length ? exportColumns.map(i => row[i]) : row));
}

module.exports = {
  fileExists,
  validNumber,
  dataDimensions,
  calculateMean,
  findTotal,
  convertToNumber,
  flatten,
  loadCSV,
  calculateMedian,
  createSlice,
};