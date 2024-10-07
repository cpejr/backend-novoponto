async function usersList(sheetID) {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error("Erro ao buscar o CSV: " + response.statusText);
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);
    const secondColumn = data.map((row) => row[1]); // Pega a segunda coluna
    return secondColumn; // Retorna o array da segunda coluna
  } catch (error) {
    console.error("Erro:", error);
  }

  function parseCSV(text) {
    const rows = text.split("\n"); // Divide o texto em linhas
    return rows.map((row) => row.split(",").map((cell) => cell.trim())); // Divide cada linha em células
  }
}

export { usersList };
