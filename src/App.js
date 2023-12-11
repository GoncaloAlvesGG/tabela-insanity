// App.js

import axios from "axios";
import React, { useMemo, useState, useEffect } from "react";
import loadingImage from './assets/waiting.gif';
import Table from "./tabela";
import "./App.css";

function App() {

  const [error, setError] = useState(null);
  const [isAddFormVisible, setAddFormVisible] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({
    nome: "",
    resultado: "",
  });
  const columns = useMemo(
    () => [
      {
        Header: "Ranking Touro Mecânico",
        columns: [
          {
            Header: "Nome",
            accessor: "nome",
            Cell: ({ row }) => (
              <span style={{ fontSize: `${row.index < 3 ? 29 - row.index : 24}px` }}>
                {row.original.nome}
              </span>
            ),
          },
          {
            Header: "Resultado",
            accessor: "resultado",
            Cell: ({ row }) => (
              <span style={{ fontSize: `${row.index < 3 ? 29 - row.index : 24}px`, fontWeight: "bold" }}>
                {row.original.resultado}
              </span>
            ),
          },
        ],
      },
    ],
    []
  );

  const fetchData = async (tableName) => {
    try {
      const result = await axios(`https://insanity-api.onrender.com/api/fetch/${tableName}`);
      setData(result.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setError("Error fetching data. Please try again.");
    }
  };

  const handleAdd = async () => {
    try {
      if (!selectedTable || !newData.nome || !newData.resultado || isNaN(newData.resultado) || newData.resultado < 0) {
        setError("Introduza um nome/resultado válido!");
        return;
      }

      const response = await axios.post(`https://insanity-api.onrender.com/api/insert/${selectedTable}`, newData);

      setAddFormVisible(false);
      const updatedData = [...data, response.data];
      setData(updatedData);
      setError(null);
      setNewData({
        nome: "",
        resultado: "",
      });
      fetchData(selectedTable);
    } catch (error) {
      console.error("Error inserting data:", error.message);
      setError("Error inserting data. Please try again.");
    }
  };

  const handleAddClick = () => {
    // Show the add form
    setAddFormVisible(true);
  };

  const handleInputChange = (e) => {
    // Update the new data state when text boxes change
    setNewData({
      ...newData,
      [e.target.name]: e.target.value,
    });
  };

  // Using useEffect to call the API once mounted and set the data
  useEffect(() => {
    (async () => {
      fetchData("TouroMecanico");
      //fetchData("Boxe");
      const resultTables = await axios("https://insanity-api.onrender.com/api/tables");
      setTables(resultTables.data.tables);
    })();
  }, [selectedTable]);

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
  };



  return (
    <div className="App">
      {data.length === 0 ? (
        <div className="loading-container">
          <p className="loading-text">
            Se está preso, culpem a merda do Render. Aguardar um pouco!
          </p>
          <img
            src={loadingImage}
            alt="Loading"
            className="loading-gif"
          />
        </div>
      ) : (
        <>
          <Table columns={columns} data={data} />
          <div className="button-container">
            <button className="add-button" onClick={handleAddClick}>
              Adicionar
            </button>
          </div>

          {isAddFormVisible && (
            <div className="add-form">

              <select onChange={handleTableChange} value={selectedTable}>
                <option value="" disabled>Tabela</option>
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nome"
                name="nome"
                value={newData.nome}
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Resultado"
                name="resultado"
                value={newData.resultado}
                onChange={handleInputChange}
              />
              <button className="confirm-button" onClick={handleAdd}>
                Confirmar
              </button>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-text" style={{ color: "#e7e6e6" }}>
                {error}
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default App;