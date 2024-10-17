async function usersList({ sheetID, userName }) {
  const split = sheetID.split("/");
  const ID = split[5];

  const csvUrl = `https://docs.google.com/spreadsheets/d/${ID}/gviz/tq?tqx=out:csv`;

  try {
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error("Erro ao buscar o CSV: " + response.statusText);
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);
    const secondColumn = data.map((row) => row[1]); // Pega a segunda coluna
    console.log(secondColumn);
    console.log(userName);
    for (let i = 1; i < secondColumn.length; i++) {
      if (secondColumn[i].includes(userName)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Erro:", error);
    return false;
  }

  function parseCSV(text) {
    const rows = text.split("\n"); // Divide o texto em linhas
    return rows.map((row) => row.split(",").map((cell) => cell.trim())); // Divide cada linha em células
  }
}

export { usersList };
