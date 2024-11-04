const fs = require("fs");

function fileExists(filename) {
  return fs.existsSync(filename);
}

function validNumber(value) {
  return typeof value === "number" ||
         (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value));
}

/**
 * Finds the dimensions of a dataset or dataframe.
 * @param {Array} data - The dataset, which can be a 1D or 2D array.
 * @returns {Array<number>} An array with two elements: [number of rows, number of columns].
 * Returns [-1, -1] if the input is invalid or not an array.
 */
function dataDimensions(data) {
  if (!Array.isArray(data)) return [-1, -1];
  return Array.isArray(data[0]) ? [data.length, data[0].length] : [data.length, -1];
}

/**
 * Calculates the sum of all valid numbers in a flat dataset.
 * @param {Array} dataset - A flat array of values, where some may be numbers or numeric strings.
 * @returns {number} The sum of all numeric values in the dataset, or 0 if invalid input.
 */
function findTotal(dataset) {
  if (!Array.isArray(dataset) || dataset.some(Array.isArray)) return 0;

  return dataset.reduce((sum, item) => sum + (validNumber(item) ? parseFloat(item) : 0), 0);
}

/**
 * Calculates the mean of a dataset.
 * @param {Array} dataset - A flat array containing values, which may include numeric strings.
 * @returns {number} The mean of all valid numeric values, or 0 if the dataset is invalid or empty.
 */
function calculateMean(dataset) {
  if (!Array.isArray(dataset) || dataset.some(Array.isArray)) return 0;

  const numbers = dataset.filter(validNumber).map(parseFloat);
  return numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
}

/**
 * Calculates the median of a dataset.
 * @param {Array} dataset - A flat array of values, which may include numeric strings.
 * @returns {number} The median of all valid numeric values, or 0 if the dataset is invalid or empty.
 */
function calculateMedian(dataset) {
  if (!Array.isArray(dataset) || dataset.some(Array.isArray)) return 0;

  const numbers = dataset.filter(validNumber).map(parseFloat).sort((a, b) => a - b);
  if (!numbers.length) return 0;
  
  const mid = Math.floor(numbers.length / 2);
  return numbers.length % 2 ? numbers[mid] : (numbers[mid - 1] + numbers[mid]) / 2;
}

/**
 * Converts strings in a specified column of a dataframe to numbers.
 * @param {Array<Array>} dataframe - A 2D array representing the dataframe.
 * @param {number} col - The column index to convert.
 * @returns {number} The count of successfully converted values in the specified column.
 */
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

/**
 * Flattens a single-column dataframe into a 1D array.
 * @param {Array<Array>} dataframe - A 2D array where each subarray represents a row.
 * @returns {Array} A 1D array containing all values from the single column of the dataframe,
 * or an empty array if the dataframe has multiple columns.
 */
function flatten(dataframe) {
  const [rows, cols] = dataDimensions(dataframe);
  if (cols !== 1) return [];
  
  return dataframe.map(row => row[0]);
}

/**
 * Loads a CSV file into a dataframe, with options to ignore specified rows and columns.
 * @param {string} csvFile - The path to the CSV file.
 * @param {Array<number>} [ignoreRows=[]] - An array of row indices to skip while loading.
 * @param {Array<number>} [ignoreCols=[]] - An array of column indices to skip while loading.
 * @returns {Array} An array containing:
 * - The loaded dataframe (2D array),
 * - The total number of rows in the original CSV,
 * - The total number of columns in the original CSV.
 * If the file does not exist, returns an empty dataframe and [-1, -1].
 */
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

/**
 * Creates a slice of the dataframe based on a column pattern and specific columns to export.
 * @param {Array<Array>} dataframe - The dataframe (2D array) to slice.
 * @param {number} columnIndex - The index of the column to check against the pattern.
 * @param {string} pattern - A string pattern to match against the column value. Use "*" for all rows.
 * @param {Array<number>} [exportColumns=[]] - An array of column indices to include in the slice.
 * If empty, includes all columns.
 * @returns {Array<Array>} A sliced version of the dataframe, containing rows that match the pattern
 * and only the specified columns.
 */
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