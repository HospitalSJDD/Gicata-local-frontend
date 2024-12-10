import React from 'react';
import '../styles/DataTable.css'; 



const DataTable = ({
  tableData,
  tableType,
  selectedCells,
  handleCellClick,
  isValidNumberCell,
}) => {
  return (
    <div className="data-table-container">
      <div className="indicator-table">
        <table className="data-table">
          <thead>
            <tr>
              {tableData.columns.map((column, index) => {
                if (index === 0 || column !== tableData.columns[index - 1]) {
                  let count = 1;
                  while (
                    index + count < tableData.columns.length &&
                    tableData.columns[index + count] === column
                  ) {
                    count++;
                  }
                  return (
                    <th key={index} colSpan={count}>
                      {column}
                    </th>
                  );
                } else {
                  return null;
                }
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const isClickable = isValidNumberCell(cell);
                  const isSelected = selectedCells.some(
                    (selectedCell) =>
                      selectedCell.row === rowIndex && selectedCell.column === cellIndex
                  );
                  let cellClass = '';
                  if (
                    cell === null ||
                    cell === undefined ||
                    (typeof cell === 'string' && cell.trim() === '') ||
                    Number.isNaN(Number(cell))
                  ) {
                    cellClass = 'highlight-text';
                  } else if (Number(cell) >= 0) {
                    cellClass = 'highlight-green';
                  }

                  return (
                    <td
                      key={cellIndex}
                      className={`${cellClass} ${isClickable ? 'clickable-cell' : ''} ${isSelected ? 'selected-cell' : ''
                        }`}
                      onClick={
                        isClickable
                          ? () => handleCellClick(cell, rowIndex, cellIndex, tableType)
                          : undefined
                      }
                    >
                      {isClickable ? (
                        <div className="cell-content">🔍</div>
                      ) : cell !== null && cell !== undefined && String(cell).trim() !== '' ? (
                        cell
                      ) : (
                        ''
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
